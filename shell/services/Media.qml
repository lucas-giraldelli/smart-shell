pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Services.Mpris
import ".."
import "../lib/rules.mjs" as Rules

// Now playing - the prototype `media` slice, from MPRIS. Which player:
//   - never one matching config.music.ignore (substrings of its identity,
//     desktop entry, title, url or command line; WhatsApp voice messages by
//     default - its PWA is a Chromium whose only tell is "web.whatsapp.com")
//   - skip junk sessions (no title, or a bare hostname with no artist) unless
//     it is the only one playing
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
    // a site with no media metadata (Reddit) reports its page title: shown
    // as the site and where on it (Rules.webTrack)
    readonly property var web: Rules.webTrack(player?.trackTitle ?? "", player?.trackArtist ?? "", player?.metadata?.["xesam:url"] ?? "")
    readonly property string title: web.title
    readonly property string artist: web.artist
    // the cover: Chromium writes it to an extension-less file in /tmp that it
    // rewrites under the same name for the next track, so the track is added
    // to the URL (ignored for a local file) to make the image load again
    // the player cover, else a YouTube video thumbnail from its url (Zen
    // reports no artwork for YouTube tabs)
    readonly property string art: player?.trackArtUrl || Rules.youtubeThumb(player?.metadata?.["xesam:url"] ?? "")
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

    // the YouTube Music app player (its popover controls)
    readonly property MprisPlayer musicPlayer: Mpris.players.values.find(p => isMusicApp(p)) ?? null

    // Bring a player window forward: its workspace, then the window - found
    // by the D-Bus connection process (the browser that owns the window),
    // else by its desktop entry in the window class.
    function focusPlayer(p) {
        if (!p)
            return;
        windowAction.command = ["sh", "-c", root.findWindow + 'hyprctl dispatch focuswindow "address:$addr" >/dev/null',
            "sh", p.dbusName, (p.desktopEntry || p.identity || "").toLowerCase()];
        windowAction.running = true;
    }
    // YouTube Music like state: read from the app over its debug port
    // (tools/ytm-like.mjs). The dock flips it at once (optimistic) and the
    // app answer confirms it. Without the port the state stays unknown and
    // the like is sent as the app "+" shortcut (Shift + "=" - Hyprland
    // cannot send the shifted "plus" keysym), without focusing its window.
    property string likeStatus: ""          // LIKE | INDIFFERENT | DISLIKE, "" unknown
    readonly property bool liked: likeStatus === "LIKE"
    readonly property string musicTrack: musicPlayer ? musicPlayer.trackTitle + musicPlayer.trackArtist : ""
    onMusicTrackChanged: {
        likeStatus = "";
        likeRefresh.restart();
    }
    function likeMusic() {
        if (!musicPlayer)
            return;
        if (likeStatus !== "")
            likeStatus = liked ? "INDIFFERENT" : "LIKE";
        likeProc.command = [Quickshell.shellDir + "/../tools/ytm-like.mjs", "toggle"];
        likeProc.running = true;
    }
    function refreshLike() {
        if (!musicPlayer || likeProc.running)
            return;
        likeProc.command = [Quickshell.shellDir + "/../tools/ytm-like.mjs", "get"];
        likeProc.running = true;
    }
    Timer {
        id: likeRefresh
        interval: 1500  // the app updates its button a moment after the track
        onTriggered: root.refreshLike()
    }
    Process {
        id: likeProc
        stdout: StdioCollector {
            onStreamFinished: {
                const s = text.trim();
                if (s)
                    root.likeStatus = s;
            }
        }
        onExited: code => {
            if (code !== 2 || command[1] !== "toggle")
                return;
            windowAction.command = ["sh", "-c", root.findWindow + 'hyprctl dispatch sendshortcut "SHIFT,equal,address:$addr" >/dev/null',
                "sh", root.musicPlayer.dbusName, "music.youtube.com"];
            windowAction.running = true;
        }
    }
    // shell snippet: finds the window of a player (by its D-Bus PID, else by class) into $addr
    readonly property string findWindow: 'pid=$(busctl --user call org.freedesktop.DBus /org/freedesktop/DBus '
        + 'org.freedesktop.DBus GetConnectionUnixProcessID s "$1" 2>/dev/null | cut -d" " -f2); '
        + 'addr=$(hyprctl clients -j | jq -r --argjson pid "${pid:-0}" --arg hint "$2" '
        + "'first(.[] | select(.pid == $pid)) // first(.[] | select((.class | ascii_downcase) | contains($hint))) | .address'); "
        + '[ -n "$addr" ] && [ "$addr" != null ] || exit 1; '
    Process {
        id: windowAction
    }

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
            // MPRIS does not signal position while playing; ask now and then
            root.player?.positionChanged();
            root.read();
        }
    }

    // the players command lines, read whenever the set of players changes
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
