pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Io
import ".."

// Connection details, live traffic and VPN - the prototype `network` slice.
// `online` comes from NetworkManager with a ping fallback (below); the route to
// the internet gives the interface, IP and gateway; NetworkManager gives the
// connection kind and VPNs; /sys gives link speed and byte counters.
Singleton {
    id: root

    property bool online: true
    property string iface: "—"
    property string kind: "—"
    property string speed: "—"
    property string ip: "—"
    property string gateway: "—"
    property string dockerNet: "—"
    // VPN profiles: openvpn3 configs (they can do the browser sign-in
    // NetworkManager cannot) and NetworkManager VPN / WireGuard connections.
    // The one used is config.vpn.profile, else the first openvpn3 config.
    property var vpnProfiles: []            // [{ source: "openvpn3" | "nm", name }]
    property var openvpnProfiles: []
    property var nmProfiles: []             // [{ name, active }]
    readonly property var vpnProfile: vpnProfiles.find(p => p.name === Config.vpn?.profile) ?? vpnProfiles[0] ?? null
    readonly property string vpn: vpnProfile?.name ?? ""
    // off | authenticating | connecting | on | error
    property string vpnState: "off"
    property string vpnServer: ""           // "br-gru": the first label of the server host name
    property bool vpnStarting: false        // we asked to connect and wait for the browser
    readonly property bool vpnOn: vpnState === "on"
    readonly property bool vpnBusy: vpnState === "authenticating" || vpnState === "connecting"
    property var down: Array(40).fill(0)    // MB/s, oldest first
    property var up: Array(40).fill(0)

    property var lastBytes: null

    // Online check: NetworkManager connectivity ("full" = online); only when
    // it says otherwise, ping 1.1.1.1 and 8.8.8.8 by IP and count either
    // answering as online. Going offline takes 3 failed checks in a row
    // (~30 s), so one lost packet or DNS hiccup never flips it; the first
    // success brings it back. Transitions are logged.
    property int failures: 0
    readonly property int failuresToOffline: 3

    function checked(ok, why) {
        if (ok) {
            if (!online)
                console.info("[network] online again:", why);
            failures = 0;
            online = true;
        } else {
            failures++;
            if (online && failures >= failuresToOffline) {
                console.info("[network] offline after", failures, "failed checks:", why);
                online = false;
            }
        }
    }

    Timer {
        running: true
        repeat: true
        triggeredOnStart: true
        interval: 10000
        onTriggered: if (!check.running) check.running = true
    }
    Process {
        id: check
        command: ["sh", "-c", "state=$(nmcli networking connectivity 2>/dev/null); echo \"nm=$state\"; "
            + "[ \"$state\" = full ] && exit 0; "
            + "ping -c 1 -W 2 -q 1.1.1.1 >/dev/null 2>&1 && { echo ping=1.1.1.1; exit 0; }; "
            + "ping -c 1 -W 2 -q 8.8.8.8 >/dev/null 2>&1 && { echo ping=8.8.8.8; exit 0; }; "
            + "echo ping=none; exit 1"]
        stdout: StdioCollector {
            onStreamFinished: {
                const why = text.trim().replace(/\n/g, " ");
                root.checked(!why.endsWith("ping=none"), why);
            }
        }
    }

    // interface, addresses, kind, speed, docker bridge and VPN
    Timer {
        running: true
        repeat: true
        triggeredOnStart: true
        interval: 15000
        onTriggered: info.running = true
    }
    Process {
        id: info
        command: ["sh", "-c", "ip -j route get 1.1.1.1; echo; "
            + "dev=$(ip -j route get 1.1.1.1 | sed -n 's/.*\"dev\":\"\\([^\"]*\\)\".*/\\1/p'); "
            + "cat /sys/class/net/$dev/speed 2>/dev/null || echo; "
            + "nmcli -t -g GENERAL.TYPE device show $dev 2>/dev/null || echo; "
            + "ip -br -4 addr | awk '($1 ~ /^(br-|docker)/) && $2 == \"UP\" { print $3; exit }'; echo; "
            + "nmcli -t -f NAME,TYPE,ACTIVE connection show | awk -F: '$2 ~ /vpn|wireguard/ { printf \"%s:%s;\", $1, $3 }'"]
        stdout: StdioCollector {
            onStreamFinished: {
                const lines = text.split("\n");
                try {
                    const route = JSON.parse(lines[0])[0];
                    root.iface = route.dev;
                    root.ip = route.prefsrc ?? "—";
                    root.gateway = route.gateway ?? "—";
                } catch (e) {
                    root.iface = "—";
                }
                const mbps = Number(lines[2]);
                root.speed = mbps > 0 ? (mbps >= 1000 ? mbps / 1000 + " Gb/s" : mbps + " Mb/s") : "—";
                const type = (lines[3] ?? "").trim();
                root.kind = type === "wifi" ? "Wi-Fi" : type === "ethernet" ? "Ethernet" : type || "—";
                root.dockerNet = (lines[4] ?? "").trim() || "—";
                root.nmProfiles = (lines[6] ?? "").trim().split(";").filter(Boolean)
                    .map(s => ({ name: s.split(":")[0], active: s.split(":")[1] === "yes" }));
                root.mergeProfiles();
            }
        }
    }

    // traffic: byte counters once a second
    Timer {
        running: root.iface !== "—"
        repeat: true
        interval: 1000
        onTriggered: {
            rx.reload();
            tx.reload();
            const now = { rx: Number(rx.text()), tx: Number(tx.text()), at: Date.now() };
            if (root.lastBytes && now.rx >= root.lastBytes.rx) {
                const secs = (now.at - root.lastBytes.at) / 1000;
                root.down = [...root.down.slice(1), (now.rx - root.lastBytes.rx) / secs / 1e6];
                root.up = [...root.up.slice(1), (now.tx - root.lastBytes.tx) / secs / 1e6];
            }
            root.lastBytes = now;
        }
    }
    FileView {
        id: rx
        path: root.iface !== "—" ? `/sys/class/net/${root.iface}/statistics/rx_bytes` : ""
        blockLoading: true
    }
    FileView {
        id: tx
        path: root.iface !== "—" ? `/sys/class/net/${root.iface}/statistics/tx_bytes` : ""
        blockLoading: true
    }

    function mergeProfiles() {
        vpnProfiles = openvpnProfiles.map(name => ({ source: "openvpn3", name }))
            .concat(nmProfiles.map(p => ({ source: "nm", name: p.name })));
        if (vpnProfile?.source === "nm")
            vpnState = nmProfiles.find(p => p.name === vpn)?.active ? "on" : "off";
    }

    function setVpnProfile(name) {
        Config.set("vpn.profile", name);
    }

    // on: openvpn3 opens the browser for the sign-in itself (a URL it prints
    // instead is opened with xdg-open); off: disconnect the session
    function toggleVpn() {
        const p = vpnProfile;
        if (!p)
            return;
        const on = vpnState !== "off" && vpnState !== "error";
        if (p.source === "nm") {
            vpnAction.command = ["nmcli", "connection", on ? "down" : "up", "id", p.name];
            vpnAction.running = true;
            return;
        }
        if (on) {
            vpnStarting = false;
            ovpnStart.running = false;
            vpnAction.command = ["openvpn3", "session-manage", "--config", p.name, "--disconnect"];
            vpnAction.running = true;
        } else {
            vpnStarting = true;
            vpnState = "authenticating";
            ovpnStart.command = ["openvpn3", "session-start", "--config", p.name];
            ovpnStart.running = true;
        }
    }
    Process {
        id: vpnAction
        onExited: {
            info.running = true;
            sessions.running = true;
        }
    }
    Process {
        id: ovpnStart
        stdout: SplitParser {
            onRead: line => {
                const url = (line.match(/https:\/\/\S+/) ?? [])[0];
                if (url)
                    Quickshell.execDetached(["xdg-open", url]);
            }
        }
        onExited: {
            root.vpnStarting = false;
            sessions.running = true;
        }
    }

    // openvpn3: the configs, the session state and the server name; every 5 s
    // while the network tab shows, every 30 s otherwise
    Timer {
        running: true
        repeat: true
        triggeredOnStart: true
        interval: (Ui.popover === "control-center" && Ui.ccTab === "network") || root.vpnBusy ? 5000 : 30000
        onTriggered: if (!sessions.running) sessions.running = true
    }
    Process {
        id: sessions
        command: ["sh", "-c", "command -v openvpn3 >/dev/null || exit 0; "
            + "echo '--configs'; openvpn3 configs-list 2>/dev/null; echo '--sessions'; openvpn3 sessions-list 2>/dev/null"]
        stdout: StdioCollector {
            onStreamFinished: {
                const [, configs = "", list = ""] = text.split(/--configs\n|--sessions\n/);
                // the config names: rows between the dashed lines, without the date
                root.openvpnProfiles = configs.split("\n")
                    .filter(l => l && !/^-+$/.test(l) && !/^Configuration Name/.test(l))
                    .map(l => l.replace(/\s+\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\s*$/, "").trim())
                    .filter(Boolean);
                root.mergeProfiles();
                if (root.vpnProfile?.source !== "openvpn3")
                    return;
                // the session of our config, if any
                const block = list.split(/^-+$/m)
                    .find(b => ((b.match(/Config name:\s*(.*)$/m) ?? [])[1] ?? "").trim() === root.vpn) ?? "";
                const status = (block.match(/Status:\s*(.*)$/m) ?? [])[1] ?? "";
                if (!block)
                    root.vpnState = root.vpnStarting ? "authenticating" : "off";
                else if (/client connected/i.test(status))
                    root.vpnState = "on";
                else if (/web auth|authentication|URL/i.test(status) || root.vpnStarting)
                    root.vpnState = "authenticating";
                else if (/connect|reconnect|wait/i.test(status))
                    root.vpnState = "connecting";
                else if (/disconnect|fail|error/i.test(status))
                    root.vpnState = "error";
                else
                    root.vpnState = "connecting";
                if (root.vpnState === "on" && !root.vpnServer)
                    server.running = true;
            }
        }
    }
    // the server short name, from the profile first remote ("br-gru.gw.openvpn.com" -> "br-gru")
    Process {
        id: server
        command: ["sh", "-c", `openvpn3 config-dump --config "$1" 2>/dev/null | awk '$1 == "remote" { print $2; exit }'`, "sh", root.vpn]
        stdout: StdioCollector {
            onStreamFinished: root.vpnServer = text.trim().split(".")[0]
        }
    }

    function copyIp() {
        Quickshell.clipboardText = ip;
    }
}
