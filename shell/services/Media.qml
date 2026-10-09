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

    // pets dance while one of config.pets.danceWith plays (YouTube Music, a
    // Chromium web app: only its command line names music.youtube.com)
    readonly property var danceWith: (Config.petsConfig?.danceWith ?? []).map(s => String(s).toLowerCase())
    function isMusicApp(p) {
        return !!p && danceWith.some(word =>
            [p.identity, p.desktopEntry, p.metadata?.["xesam:url"], cmdlines[pidOf(p)]].filter(Boolean).join(" ").toLowerCase().includes(word));
    }
    readonly property bool dancing: Mpris.players.values.some(p => p.isPlaying && isMusicApp(p))
    // the tile shows the YouTube Music app (its volume popover is offered then)
    readonly property bool showingMusicApp: isMusicApp(player)

    readonly property bool active: player !== null
    readonly property bool playing: player?.isPlaying ?? false
    readonly property string title: player?.trackTitle ?? ""
    readonly property string artist: player?.trackArtist ?? ""
    readonly property string album: player?.trackAlbum ?? ""
    readonly property string source: player?.identity ?? ""
    // track length in seconds: Firefox / Zen sometimes leave lengthSupported
    // false (and `length` unusable) but put mpris:length (µs) in the metadata
    readonly property real reportedLength: !player ? 0
        : player.lengthSupported && player.length > 0 ? player.length
        : Number(player.metadata?.["mpris:length"] ?? 0) / 1e6
    readonly property string track: player ? `${player.dbusName}|${title}|${artist}` : ""

    // Firefox briefly reports position 0 / no length when playback starts or
    // pauses, which made the bar flash empty. Keep the last good reading of
    // this track instead; a new track or a real seek still moves it.
    property string lastTrack: ""
    property real lastLength: 0
    property real lastPosition: 0
    function read() {
        if (!player)
            return;
        const pos = player.position, len = reportedLength;
        if (track !== lastTrack) {
            lastTrack = track;
            lastLength = len;
            lastPosition = pos;
            return;
        }
        if (len > 0)
            lastLength = len;
        if (pos > 0 || lastPosition < 2)
            lastPosition = pos;
    }
    onTrackChanged: read()
    readonly property real length: lastLength
    readonly property real progress: lastLength > 0 ? Math.max(0, Math.min(1, lastPosition / lastLength)) : 0

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
            root.read();
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
