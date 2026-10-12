pragma Singleton

import QtQuick
import Quickshell
import ".."

// The clock timer (prototype: the `timer` in the ui slice, components/clock):
// minutes, an optional name and a colour, started from the clock right-click
// popover. The clock shows it on its second line in that colour until it
// ends; then a notification, and it is gone. Saved in Ui.timer, so it
// survives a restart (one that ended meanwhile still notifies).
Singleton {
    id: root

    readonly property bool running: Ui.timer !== null
    readonly property real end: Ui.timer?.end ?? 0
    readonly property color color: Ui.timer?.color ?? Theme.warn
    readonly property string label: Ui.timer?.label ?? ""
    property real now: Date.now()
    readonly property real remaining: running ? Math.max(0, end - now) : 0
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
    function cancel() {
        Ui.timer = null;
    }

    Timer {
        running: root.running
        repeat: true
        triggeredOnStart: true
        interval: 1000
        onTriggered: {
            root.now = Date.now();
            if (root.now < root.end)
                return;
            Quickshell.execDetached(["notify-send", "-a", "smart-shell", "-i", "timer", "-u", "critical",
                I18n.t("timer.done"), root.label || I18n.t("timer.title")]);
            root.cancel();
        }
    }
}
