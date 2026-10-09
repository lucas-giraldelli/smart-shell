pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Services.Mpris

// Now playing - the prototype's `media` slice, from MPRIS. The player shown is
// the one playing, else the first one; `progress` is 0..1 of the track.
Singleton {
    id: root

    // players with something loaded (a browser keeps empty ones around)
    readonly property var players: Mpris.players.values.filter(p => p.trackTitle)
    readonly property MprisPlayer player: players.find(p => p.isPlaying) ?? players[0] ?? null

    readonly property bool active: player !== null
    readonly property bool playing: player?.isPlaying ?? false
    readonly property string title: player?.trackTitle ?? ""
    readonly property string artist: player?.trackArtist ?? ""
    readonly property string source: player?.identity ?? ""
    readonly property real progress: player && player.lengthSupported && player.length > 0
        ? Math.max(0, Math.min(1, player.position / player.length)) : 0

    function toggle() {
        if (player?.canTogglePlaying)
            player.togglePlaying();
    }

    // MPRIS doesn't signal position while playing; ask now and then
    Timer {
        running: root.playing
        repeat: true
        interval: 1000
        onTriggered: root.player.positionChanged()
    }
}
