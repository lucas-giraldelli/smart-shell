pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Io

// The music, from cava when it's installed (optional): while anything plays,
// cava runs with 4 bars at 30 fps in raw ascii mode. `bars` (0..1, bass to
// treble) drive the player's eq; `level` is their mean and a sharp rise of it
// is a `beat()`, both for the dancing pets (`active`: only for a music app).
// Without cava the eq and the pets keep their own fixed motion.
Singleton {
    id: root

    readonly property bool running: Caps.cava && Media.playing
    readonly property bool active: running && Media.dancing
    property var bars: [0, 0, 0, 0]
    property real level: 0
    property real last: 0           // the previous frame's level
    property real lastBeat: 0       // ms
    signal beat

    Process {
        running: root.running
        // the config goes to a temp file, then cava reads it
        command: ["sh", "-c", 'conf="${XDG_RUNTIME_DIR:-/tmp}/smart-shell-cava.conf"; '
            + 'printf "[general]\\nbars = 4\\nframerate = 30\\n[output]\\nmethod = raw\\nraw_target = /dev/stdout\\n'
            + 'data_format = ascii\\nascii_max_range = 100\\nbar_delimiter = 59\\nframe_delimiter = 10\\n" > "$conf"; exec cava -p "$conf"']
        onRunningChanged: if (!running) {
            root.level = 0;
            root.bars = [0, 0, 0, 0];
        }
        stdout: SplitParser {
            onRead: line => {
                const bars = line.split(";").filter(Boolean).map(Number);
                if (!bars.length)
                    return;
                const level = bars.reduce((a, b) => a + b, 0) / bars.length / 100;
                const now = Date.now();
                // a beat: the level jumps up past a floor, at most ~4.5 a second
                if (level > 0.25 && level - root.last > 0.1 && now - root.lastBeat > 220) {
                    root.lastBeat = now;
                    root.beat();
                }
                root.bars = bars.map(b => b / 100);
                root.last = level;
                root.level = level;
            }
        }
    }
}
