pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Io
import ".."

// The clock timer (prototype: the `timer` in the ui slice, components/clock):
// minutes, an optional name and a colour, started from the clock right-click
// popover, which then pauses / resumes or stops it. The clock shows it on its
// second line in that colour; when it ends it rings - the tile shakes and the
// freedesktop alarm plays (pw-play, again and again for up to 5 minutes) -
// until a click stops it. Saved in Ui.timer ({ end, color, label, left, done }:
// `left` is the time left in ms while paused), so it survives a restart (one
// that ended meanwhile rings when the dock is back).
Singleton {
    id: root

    readonly property bool running: Ui.timer !== null
    readonly property real end: Ui.timer?.end ?? 0
    readonly property color color: Ui.timer?.color ?? Theme.warn
    readonly property string label: Ui.timer?.label ?? ""
    readonly property bool paused: (Ui.timer?.left ?? null) !== null
    readonly property bool ringing: Ui.timer?.done === true
    property real now: Date.now()
    readonly property real remaining: !running ? 0 : paused ? Ui.timer.left : Math.max(0, end - now)
    // "4:05" / "1:02:30"
    readonly property string remainingText: {
        const s = Math.ceil(remaining / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
        const pad = n => String(n).padStart(2, "0");
        return h ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
    }

    function start(minutes, color, label) {
        now = Date.now();
        Ui.timerLast = { minutes, color, label };
        Ui.timer = { end: now + minutes * 60000, color, label };
    }
    // play / pause in one
    function toggle() {
        const t = Ui.timer;
        if (!t)
            return;
        now = Date.now();
        Ui.timer = paused ? { end: now + t.left, color: t.color, label: t.label, left: null }
            : { end: t.end, color: t.color, label: t.label, left: Math.max(0, t.end - now) };
    }
    function cancel() {
        Ui.timer = null;
    }

    // the alarm: one play every 6.5 s (it lasts 6 s) at a fifth of the
    // volume (at full it is far too loud); stopping kills it
    Process {
        id: alarm
        command: ["pw-play", "--volume", "0.2", "/usr/share/sounds/freedesktop/stereo/alarm-clock-elapsed.oga"]
    }
    Timer {
        running: root.ringing
        repeat: true
        triggeredOnStart: true
        interval: 6500
        onTriggered: alarm.running = Date.now() - root.end < 5 * 60000
        onRunningChanged: if (!running) alarm.running = false
    }

    Timer {
        running: root.running && !root.paused && !root.ringing
        repeat: true
        triggeredOnStart: true
        interval: 1000
        onTriggered: {
            root.now = Date.now();
            if (root.now < root.end)
                return;
            const t = Ui.timer;
            Ui.timer = { end: t.end, color: t.color, label: t.label, left: null, done: true };
        }
    }
}
