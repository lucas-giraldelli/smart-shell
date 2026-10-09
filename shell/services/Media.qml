pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Services.Mpris
import ".."

// Now playing - the prototype's `media` slice, from MPRIS. Which player:
//   - never one matching config.music.ignore (substrings of its identity,
//     desktop entry, title, url or command line; WhatsApp's voice messages by
//     default - its PWA is a Chromium whose only tell is "web.whatsapp.com")
//   - skip junk sessions (no title, or a bare hostname with no artist) unless
//     it's the only one playing
//   - prefer the one playing, then the one that played last, then the first
// `progress` is 0..1 of the track.
Singleton {
    id: root

    readonly property var ignore: (Config.music?.ignore ?? []).map(s => String(s).toLowerCase())
    property var cmdlines: ({})     // pid -> command line
    property var lastPlayed: ({})   // dbusName -> ms

    function pidOf(p) {
        return (p.dbusName.match(/\.instance_?(\d+)/) ?? [])[1] ?? "";
    }
    function ignored(p) {
        const keys = [p.identity, p.desktopEntry, p.trackTitle, p.metadata?.["xesam:url"], cmdlines[pidOf(p)]]
            .filter(Boolean).join(" ").toLowerCase();
        return ignore.some(word => keys.includes(word));
    }
    function junk(p) {
        return !p.trackTitle || (!p.trackArtist && /^[\w-]+(\.[\w-]+)+$/.test(p.trackTitle.trim()));
    }

    readonly property var players: Mpris.players.values.filter(p => !ignored(p))
    readonly property MprisPlayer player: {
        const playing = players.filter(p => p.isPlaying);
        const good = players.filter(p => !junk(p));
        return playing.find(p => !junk(p))
            ?? (playing.length === 1 ? playing[0] : null)
            ?? good.slice().sort((a, b) => (lastPlayed[b.dbusName] ?? 0) - (lastPlayed[a.dbusName] ?? 0))[0]
            ?? null;
    }

    readonly property bool active: player !== null
    readonly property bool playing: player?.isPlaying ?? false
    readonly property string title: player?.trackTitle ?? ""
    readonly property string artist: player?.trackArtist ?? ""
    readonly property string source: player?.identity ?? ""
    // track length in seconds: Firefox / Zen leave lengthSupported false (and
    // `length` unusable), but put mpris:length (µs) in the metadata
    readonly property real length: !player ? 0
        : player.lengthSupported && player.length > 0 ? player.length
        : Number(player.metadata?.["mpris:length"] ?? 0) / 1e6
    readonly property real progress: player && length > 0
        ? Math.max(0, Math.min(1, player.position / length)) : 0

    function toggle() {
        if (player?.canTogglePlaying)
            player.togglePlaying();
    }

    // remember when each player last played
    Timer {
        running: true
        repeat: true
        interval: 1000
        onTriggered: {
            const playing = Mpris.players.values.filter(p => p.isPlaying);
            if (!playing.length)
                return;
            const last = Object.assign({}, root.lastPlayed);
            for (const p of playing)
                last[p.dbusName] = Date.now();
            root.lastPlayed = last;
            // MPRIS doesn't signal position while playing; ask now and then
            root.player?.positionChanged();
        }
    }

    // the players' command lines, read whenever the set of players changes
    Connections {
        target: Mpris.players
        function onValuesChanged() { cmd.refresh(); }
    }
    Component.onCompleted: cmd.refresh()
    Process {
        id: cmd
        function refresh() {
            const pids = Mpris.players.values.map(p => root.pidOf(p)).filter(Boolean);
            if (!pids.length)
                return;
            command = ["sh", "-c", 'for p in "$@"; do printf "%s\\t" "$p"; tr "\\0" " " < /proc/$p/cmdline; echo; done', "sh", ...pids];
            running = true;
        }
        stdout: StdioCollector {
            onStreamFinished: {
                const map = {};
                for (const line of text.split("\n").filter(Boolean)) {
                    const i = line.indexOf("\t");
                    map[line.slice(0, i)] = line.slice(i + 1);
                }
                root.cmdlines = map;
            }
        }
    }
}
