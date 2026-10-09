pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Io

// Connection details, live traffic and VPN - the prototype's `network` slice.
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
    property string vpn: ""                 // NetworkManager VPN / WireGuard connection, "" = none
    property bool vpnOn: false
    property var down: Array(40).fill(0)    // MB/s, oldest first
    property var up: Array(40).fill(0)

    property var lastBytes: null

    // Online check: NetworkManager's connectivity ("full" = online); only when
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
            + "nmcli -t -f NAME,TYPE,ACTIVE connection show | awk -F: '$2 ~ /vpn|wireguard/ { print $1 \":\" $3; exit }'"]
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
                const [vpnName, active] = (lines[6] ?? "").trim().split(":");
                root.vpn = vpnName ?? "";
                root.vpnOn = active === "yes";
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

    function toggleVpn() {
        if (!vpn)
            return;
        vpnAction.command = ["nmcli", "connection", vpnOn ? "down" : "up", "id", vpn];
        vpnAction.running = true;
    }
    Process {
        id: vpnAction
        onExited: info.running = true
    }

    function copyIp() {
        Quickshell.clipboardText = ip;
    }
}
