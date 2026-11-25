pragma Singleton
import QtQuick
import Quickshell
import Quickshell.Io
import ".."

// The torrents of a qBittorrent Web UI (prototype: the `torrents` slice),
// with the login in ~/.config/smart-shell/qbittorrent.json
// ({ "url", "username", "password" }, kept out of config.json and of any
// repo), and whether the web UIs in config torrents.services answer (any
// HTTP answer below 500 counts). Read every hour, as the list opens and from
// its refresh button. The session cookie lives in $XDG_RUNTIME_DIR; a 403 logs in
// again (the password goes to curl on stdin, never on its command line).
// remove() takes a torrent out of qBittorrent, keeping its files; start()
// brings a stopped one back. `files` are the .torrent files in the Downloads
// folder (xdg-user-dir DOWNLOAD), newest first, read as the list opens;
// add() sends one to qBittorrent through tools/torrent-arr.py (Radarr or
// Sonarr get the movie or series first) and deletes it once qBittorrent took it. With ~/.config/smart-shell/tracker.json
// ({ "name", "url", "token" }: a UNIT3D tracker and its API key) it also reads
// your account there (/api/user: ratio, buffer, bonus points, hit and runs)
// every 15 minutes; the key goes to curl on stdin as a header file.
Singleton {
    id: root

    property var list: []            // [{ hash, name, size, progress, state, num_seeds, num_complete, seeding_time, added_on }]
    property real dlspeed: 0
    property real upspeed: 0
    property bool vpn: true          // qBittorrent is connected (through the VPN)
    property var services: []        // [{ name, url, up }]
    readonly property var down: services.filter(s => !s.up).map(s => s.name).concat(vpn ? [] : ["VPN"])
    property var tracker: null       // { name, ratio, uploaded, downloaded, buffer, seedbonus, hit_and_runs }
    property bool loading: false
    property bool loaded: false      // a login file and an answer: the widget shows
    property string url: ""
    property var files: []           // [{ path, name, mtime }]: the .torrent files in Downloads
    property var adding: []          // paths on their way to qBittorrent

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
    // the .torrent files in Downloads, newest first
    function scan() {
        if (!lister.running)
            lister.running = true;
    }
    // send a .torrent file to qBittorrent; once it took it, the file goes
    function add(path) {
        if (adding.includes(path))
            return;
        adding = adding.concat([path]);
        files = files.filter(f => f.path !== path);
        if (!sender.running)
            sender.running = true;
    }
    Process {
        id: lister
        command: ["sh", "-c", 'd=$(xdg-user-dir DOWNLOAD 2>/dev/null); [ -d "$d" ] || d="$HOME/Downloads"; '
            + 'find "$d" -maxdepth 1 -type f -iname "*.torrent" -printf "%T@\\t%p\\n" | sort -rn']
        stdout: StdioCollector {
            onStreamFinished: {
                root.files = text.split("\n").filter(l => l.includes("\t")).map(l => {
                    const [mtime, path] = [l.slice(0, l.indexOf("\t")), l.slice(l.indexOf("\t") + 1)];
                    return { path, name: path.slice(path.lastIndexOf("/") + 1).replace(/\.torrent$/i, ""), mtime: Number(mtime) };
                }).filter(f => !root.adding.includes(f.path));
            }
        }
    }
    // the paths in `adding`, through tools/torrent-arr.py: the movie or
    // series goes into Radarr/Sonarr first (radarr.json, sonarr.json), then
    // the torrent into qBittorrent in their category, the file deleted once
    // it took it
    Process {
        id: sender
        property var batch: []
        onRunningChanged: if (running) batch = root.adding
        command: ["python3", "-I", Quickshell.shellDir + "/../tools/torrent-arr.py", "add"].concat(root.adding)
        onExited: {
            root.adding = root.adding.filter(p => !batch.includes(p));
            if (root.adding.length)
                Qt.callLater(() => running = true);
            root.scan();
            root.refresh();
        }
    }

    // a torrent added here whose import Radarr/Sonarr blocked (its name does
    // not match the library, e.g. a year off) is imported by hand
    Timer {
        running: true
        repeat: true
        triggeredOnStart: true
        interval: 10 * 60000
        onTriggered: if (!unblocker.running) unblocker.running = true
    }
    Process {
        id: unblocker
        command: ["python3", "-I", Quickshell.shellDir + "/../tools/torrent-arr.py", "unblock"]
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
        interval: 60 * 60000
        onTriggered: root.refresh()
    }
    // and once more as the list opens
    Connections {
        target: Ui
        function onPopoverChanged() {
            if (Ui.popover === "torrents") {
                root.refresh();
                root.scan();
            }
        }
    }

    Timer {
        running: true
        repeat: true
        triggeredOnStart: true
        interval: 15 * 60000
        onTriggered: account.running = true
    }
    Process {
        id: account
        command: ["sh", "-c", 'f="${XDG_CONFIG_HOME:-$HOME/.config}/smart-shell/tracker.json"; [ -r "$f" ] || exit 2; '
            + 'jq -j \'"Authorization: Bearer " + .token\' "$f" | curl -sf -m 10 -H "Accept: application/json" -H @- "$(jq -r .url "$f")/api/user" '
            + '| jq -c --arg name "$(jq -r .name "$f")" \'{name: $name, ratio, uploaded, downloaded, buffer, seedbonus, hit_and_runs}\'']
        stdout: StdioCollector {
            onStreamFinished: {
                try {
                    root.tracker = JSON.parse(text);
                } catch (e) {}
            }
        }
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
