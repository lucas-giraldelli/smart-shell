pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Io

// The music's beat for the dancing pets, from cava when it's installed
// (optional): while the pets dance, cava runs with 4 bars at 30 fps in raw
// ascii mode and `level` follows the loudness (0..1); a sharp rise is a
// `beat()`. Without cava (or between songs) the pets keep a fixed ~120 bpm.
Singleton {
    id: root

    readonly property bool active: Caps.cava && Media.dancing
    property real level: 0
    property real last: 0           // the previous frame's level
    property real lastBeat: 0       // ms
    signal beat

    Process {
        running: root.active
        // the config goes to a temp file, then cava reads it
        command: ["sh", "-c", 'conf="${XDG_RUNTIME_DIR:-/tmp}/smart-shell-cava.conf"; '
            + 'printf "[general]\\nbars = 4\\nframerate = 30\\n[output]\\nmethod = raw\\nraw_target = /dev/stdout\\n'
            + 'data_format = ascii\\nascii_max_range = 100\\nbar_delimiter = 59\\nframe_delimiter = 10\\n" > "$conf"; exec cava -p "$conf"']
        onRunningChanged: if (!running) root.level = 0
        stdout: SplitParser {
            onRead: line => {
                const bars = line.split(";").filter(Boolean).map(Number);
                if (!bars.length)
                    return;
                const level = bars.reduce((a, b) => a + b, 0) / bars.length / 100;
                const now = Date.now();
                // a beat: the level jumps up past a floor, at most ~4 a second
                if (level > 0.35 && level - root.last > 0.15 && now - root.lastBeat > 250) {
                    root.lastBeat = now;
                    root.beat();
                }
                root.last = level;
                root.level = level;
            }
        }
    }
}
