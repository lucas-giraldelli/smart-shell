pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Io

// CPU load, free memory, die temperature and uptime - the prototype's `system`
// slice (prototype/src/services/system.js simulates it). Sources: /proc/stat,
// /proc/meminfo (MemAvailable), the k10temp Tccd1 sensor (the real die
// temperature; Tctl runs hot on purpose) and /proc/uptime.
Singleton {
    id: root

    readonly property int tickMs: 900       // the prototype's TICK_MS

    property real load: 0                   // %
    property int temp: 0                    // °C
    property real memFree: 0                // GiB
    property int memTotal: 0                // GiB
    property var history: Array(40).fill(0) // recent CPU load, oldest first
    property date bootedAt: new Date()

    property var lastCpu: null
    property string tempPath: ""

    function tick() {
        stat.reload();
        meminfo.reload();
        if (tempPath)
            tempFile.reload();
    }

    function onStat(text) {
        const f = text.split("\n")[0].trim().split(/\s+/).slice(1).map(Number);
        const idle = f[3] + f[4];
        const total = f.reduce((a, b) => a + b, 0);
        if (lastCpu && total > lastCpu.total) {
            load = Math.max(0, Math.min(100, (1 - (idle - lastCpu.idle) / (total - lastCpu.total)) * 100));
            history = [...history.slice(1), load];
        }
        lastCpu = { idle, total };
    }

    function onMeminfo(text) {
        const kib = key => Number((text.match(new RegExp("^" + key + ":\\s+(\\d+)", "m")) ?? [0, 0])[1]);
        const gib = 1024 * 1024;
        memTotal = Math.round(kib("MemTotal") / gib);
        memFree = kib("MemAvailable") / gib;
    }

    Timer {
        running: true
        repeat: true
        triggeredOnStart: true
        interval: root.tickMs
        onTriggered: root.tick()
    }

    FileView {
        id: stat
        path: "/proc/stat"
        onLoaded: root.onStat(text())
    }
    FileView {
        id: meminfo
        path: "/proc/meminfo"
        onLoaded: root.onMeminfo(text())
    }
    FileView {
        id: tempFile
        path: root.tempPath
        onLoaded: root.temp = Math.round(Number(text()) / 1000)
    }
    FileView {
        path: "/proc/uptime"
        onLoaded: root.bootedAt = new Date(Date.now() - Number(text().split(" ")[0]) * 1000)
    }

    // find the k10temp input labelled Tccd1
    Process {
        running: true
        command: ["sh", "-c", "for h in /sys/class/hwmon/hwmon*; do [ \"$(cat $h/name)\" = k10temp ] || continue; for l in $h/temp*_label; do [ \"$(cat $l)\" = Tccd1 ] && echo ${l%_label}_input; done; done"]
        stdout: StdioCollector {
            onStreamFinished: root.tempPath = text.trim().split("\n")[0]
        }
    }
}
