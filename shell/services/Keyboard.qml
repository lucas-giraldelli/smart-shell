pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Hyprland

// Caps Lock state - the prototype `keyboard` slice
// (prototype/src/services/keyboard.js): the keyboards capslock LEDs in
// /sys/class/leds, which the kernel keeps in sync even when the keyboard has
// no LED. sysfs cannot be watched, so they are read 5 times a second.
Singleton {
    id: root

    property bool capsLock: false
    // Hyprland current submap ("" = none): Alt+R enters "resize"
    property string submap: ""

    Connections {
        target: Hyprland
        function onRawEvent(event) {
            if (event.name === "submap")
                root.submap = event.data === "reset" ? "" : event.data;
        }
    }
    property var paths: []

    Process {
        running: true
        command: ["sh", "-c", "ls -d /sys/class/leds/*::capslock 2>/dev/null"]
        stdout: StdioCollector {
            onStreamFinished: root.paths = text.split("\n").filter(Boolean).map(p => p + "/brightness")
        }
    }

    Instantiator {
        id: leds
        model: root.paths
        delegate: FileView {
            required property string modelData
            path: modelData
            blockLoading: true
        }
    }

    Timer {
        running: root.paths.length > 0
        repeat: true
        interval: 200
        onTriggered: {
            let on = false;
            for (let i = 0; i < leds.count; i++) {
                const led = leds.objectAt(i);
                led.reload();
                on = on || led.text().trim() === "1";
            }
            if (on !== root.capsLock)
                root.capsLock = on;
        }
    }
}
