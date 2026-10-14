pragma Singleton
import QtQuick
import Quickshell
import Quickshell.Io
import ".."

// The torrents of a qBittorrent Web UI (prototype: the `torrents` slice),
// with the login in ~/.config/smart-shell/qbittorrent.json
// ({ "url", "username", "password" }, kept out of config.json and of any
// repo), and whether the web UIs in config torrents.services answer (any
// HTTP answer below 500 counts). Read every 5 s while the list is open, every
// 60 s otherwise. The session cookie lives in $XDG_RUNTIME_DIR; a 403 logs in
// again (the password goes to curl on stdin, never on its command line).
// remove() takes a torrent out of qBittorrent, keeping its files; start()
// brings a stopped one back.
Singleton {
    id: root

    property var list: []            // [{ hash, name, size, progress, state, num_seeds, num_complete, seeding_time, added_on }]
    property real dlspeed: 0
    property real upspeed: 0
    property bool vpn: true          // qBittorrent is connected (through the VPN)
    property var services: []        // [{ name, url, up }]
    readonly property var down: services.filter(s => !s.up).map(s => s.name).concat(vpn ? [] : ["VPN"])
    property bool loading: false
    property bool loaded: false      // a login file and an answer: the widget shows
    property string url: ""

    // shell functions: $f the login file, $url, get <path>, post <path> <data>
    // (both log in again on a 403)
    readonly property string lib: 'f="${XDG_CONFIG_HOME:-$HOME/.config}/smart-shell/qbittorrent.json"; [ -r "$f" ] || exit 2; '
        + 'url=$(jq -r .url "$f"); jar="${XDG_RUNTIME_DIR:-/tmp}/smart-shell-qbit.cookies"; '
        + 'login() { jq -j .password "$f" | curl -sf -m 5 -c "$jar" -o /dev/null --data-urlencode "username=$(jq -r .username "$f")" --data-urlencode password@- "$url/api/v2/auth/login"; }; '
        + 'get() { curl -sf -m 5 -b "$jar" "$url/api/v2/$1" || { login && curl -sf -m 5 -b "$jar" "$url/api/v2/$1"; }; }; '
        + 'post() { curl -sf -m 5 -b "$jar" -d "$2" "$url/api/v2/$1" || { login && curl -sf -m 5 -b "$jar" -d "$2" "$url/api/v2/$1"; }; }; '

    readonly property string script: lib
        + 't=$(get torrents/info) || exit 1; x=$(get transfer/info) || exit 1; '
        // one HTTP code per service URL ($1: a JSON list), 000 when it does not answer
        + 'codes=$(printf %s "$1" | jq -r ".[]" | while read -r u; do curl -s -o /dev/null -m 3 -w "%{http_code}\\n" "$u"; done | jq -sc .); '
        + 'printf \'{"url":"%s","transfer":%s,"codes":%s,"torrents":%s}\' "$url" "$x" "${codes:-[]}" '
        + '"$(printf %s "$t" | jq -c "[.[] | {hash, name, size, progress, state, num_seeds, num_complete, seeding_time, added_on}]")"'

    function refresh() {
        if (fetch.running)
            return;
        loading = true;
        fetch.running = true;
    }
    // bring a stopped one back (qBittorrent 5: start; 4: resume)
    function start(hash) {
        act("start", "resume", hash);
    }
    // out of qBittorrent, its files kept (the library has them)
    function remove(hash) {
        Quickshell.execDetached(["sh", "-c", lib + 'post torrents/delete "hashes=$1&deleteFiles=false"', "sh", hash]);
        after.restart();
    }
    function act(verb, old, hash) {
        Quickshell.execDetached(["sh", "-c", lib + 'post "torrents/$1" "hashes=$3" || post "torrents/$2" "hashes=$3"', "sh", verb, old, hash]);
        after.restart();
    }
    // re-read a moment after an action
    Timer {
        id: after
        interval: 800
        onTriggered: root.refresh()
    }

    Timer {
        running: true
        repeat: true
        triggeredOnStart: true
        interval: Ui.popover === "torrents" ? 5000 : 60000
        onTriggered: root.refresh()
    }

    Process {
        id: fetch
        command: ["sh", "-c", root.script, "sh", JSON.stringify((Config.torrents?.services ?? []).map(s => s.url))]
        stdout: StdioCollector {
            onStreamFinished: {
                root.loading = false;
                let data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    return;     // no login file, or qBittorrent is down: keep the last list
                }
                root.url = data.url;
                root.list = data.torrents;
                root.dlspeed = data.transfer.dl_info_speed;
                root.upspeed = data.transfer.up_info_speed;
                root.vpn = data.transfer.connection_status === "connected";
                root.services = (Config.torrents?.services ?? []).map((s, i) => ({
                    name: s.name, url: s.url, up: data.codes[i] > 0 && data.codes[i] < 500
                }));
                root.loaded = true;
            }
        }
        onExited: root.loading = false
    }
}
