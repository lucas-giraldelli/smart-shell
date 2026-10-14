pragma Singleton
import QtQuick
import Quickshell
import Quickshell.Io
import ".."

// The torrents of a qBittorrent Web UI (prototype: the `torrents` slice),
// with the login in ~/.config/smart-shell/qbittorrent.json
// ({ "url", "username", "password" }, kept out of config.json and of any
// repo). Read every 5 s while the list is open, every 60 s otherwise. The
// session cookie lives in $XDG_RUNTIME_DIR; a 403 logs in again (the
// password goes to curl on stdin, never on its command line).
Singleton {
    id: root

    property var list: []            // [{ hash, name, size, progress, state, num_seeds, num_complete, dlspeed, upspeed, added_on }]
    property real dlspeed: 0
    property real upspeed: 0
    property bool loading: false
    property bool loaded: false      // a login file and an answer: the widget shows
    property date updatedAt: new Date(0)
    property string url: ""

    readonly property string script: 'f="${XDG_CONFIG_HOME:-$HOME/.config}/smart-shell/qbittorrent.json"; [ -r "$f" ] || exit 2; '
        + 'url=$(jq -r .url "$f"); jar="${XDG_RUNTIME_DIR:-/tmp}/smart-shell-qbit.cookies"; '
        + 'get() { curl -sf -m 5 -b "$jar" "$url/api/v2/$1"; }; '
        + 'login() { jq -j .password "$f" | curl -sf -m 5 -c "$jar" -o /dev/null --data-urlencode "username=$(jq -r .username "$f")" --data-urlencode password@- "$url/api/v2/auth/login"; }; '
        + 't=$(get torrents/info) || { login && t=$(get torrents/info); } || exit 1; '
        + 'x=$(get transfer/info) || exit 1; '
        + 'printf \'{"url":"%s","transfer":%s,"torrents":%s}\' "$url" "$x" '
        + '"$(printf %s "$t" | jq -c "[.[] | {hash, name, size, progress, state, num_seeds, num_complete, dlspeed, upspeed, added_on}]")"'

    function refresh() {
        if (fetch.running)
            return;
        loading = true;
        fetch.running = true;
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
        command: ["sh", "-c", root.script]
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
                root.updatedAt = new Date();
                root.loaded = true;
            }
        }
        onExited: root.loading = false
    }
}
