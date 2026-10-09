pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Io
import "../lib/rules.mjs" as Rules

// Monitor brightness over DDC/CI (ddcutil) and the night light (hyprsunset) -
// the prototype's `display` slice. DDC writes are slow, so slider moves are
// coalesced and only the latest value is sent.
Singleton {
    id: root

    property string name: ""
    property int brightness: 0              // % of the monitor's max (waybar's brightness.sh)
    property int max: 100                   // the monitor's raw VCP 10 range
    property bool loaded: false
    property bool night: false
    property int nightK: 4500

    property int pending: -1

    function set(v) {
        brightness = Rules.clampBrightness(Math.round(v));
        pending = brightness;
        writeTimer.restart();
    }
    function step(dir) {
        set(brightness + dir * 5);
    }

    // night light: hyprsunset runs while it is on
    function setNight(on) {
        night = on;
        sunset.command = on
            ? ["sh", "-c", `hyprctl hyprsunset temperature ${nightK} >/dev/null 2>&1 || (hyprsunset -t ${nightK} >/dev/null 2>&1 &)`]
            : ["sh", "-c", "pkill -x hyprsunset"];
        sunset.running = true;
    }
    function setNightK(k) {
        nightK = k;
        setNight(true);
    }

    Timer {
        id: writeTimer
        interval: 150
        onTriggered: {
            if (root.pending < 0 || write.running)
                return;
            write.command = ["ddcutil", "setvcp", "10", String(Math.round(root.pending * root.max / 100)), "--noverify"];
            root.pending = -1;
            write.running = true;
        }
    }
    Process {
        id: write
        onExited: if (root.pending >= 0) writeTimer.restart()
    }

    // read back now and then, in case the monitor's own buttons changed it
    Timer {
        running: true
        repeat: true
        triggeredOnStart: true
        interval: 60000
        onTriggered: if (!write.running && root.pending < 0) read.running = true
    }
    Process {
        id: read
        command: ["sh", "-c", "ddcutil detect --brief 2>/dev/null | sed -n 's/^ *Monitor: *[^:]*:\\([^:]*\\):.*/\\1/p' | head -1; ddcutil getvcp 10 --brief"]
        stdout: StdioCollector {
            onStreamFinished: {
                const lines = text.trim().split("\n");
                root.name = lines[0] ?? "";
                const m = (lines[1] ?? "").match(/^VCP 10 C (\d+) (\d+)/);
                if (m) {
                    root.max = Number(m[2]);
                    root.brightness = Math.floor(Number(m[1]) * 100 / root.max);
                    root.loaded = true;
                }
            }
        }
    }

    Process {
        id: sunset
    }
    Process {
        running: true
        command: ["pgrep", "-x", "hyprsunset"]
        onExited: code => root.night = code === 0
    }
}
