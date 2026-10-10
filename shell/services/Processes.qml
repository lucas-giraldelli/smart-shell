pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Io
import "../lib/rules.mjs" as Rules

// The user's biggest memory users, grouped by executable (a web app by its
// own name, see Rules.topProcesses) - the prototype's
// `system.top` (prototype/src/data/snapshot.js). Polled every 3 s, only while
// something shows it (`watchers`): `ps` gives each process's RSS, parent and
// command line, and /proc/<pid>/exe its executable.
Singleton {
    id: root

    property int watchers: 0
    property var top: []        // [{ name, count, memMiB, pids }]

    function refresh() {
        if (!poll.running)
            poll.running = true;
    }

    // `kill -TERM|-KILL <pids>` for one group, then look again
    function signal(group, sig) {
        Quickshell.execDetached(["kill", "-" + sig, ...group.pids.map(String)]);
        Qt.callLater(refresh);
    }

    Timer {
        running: root.watchers > 0
        repeat: true
        triggeredOnStart: true
        interval: 3000
        onTriggered: root.refresh()
    }

    Process {
        id: poll
        command: ["sh", "-c", "ps -u \"$(id -u)\" -ww -o pid=,ppid=,rss=,args=; echo --exe; "
            + "find /proc -maxdepth 2 -name exe -user \"$(id -u)\" -printf '%h %l\\n' 2>/dev/null"]
        stdout: StdioCollector {
            onStreamFinished: {
                const [ps, exes] = text.split("--exe\n");
                const exe = {};
                for (const line of (exes ?? "").split("\n").filter(Boolean)) {
                    const i = line.indexOf(" ");
                    exe[line.slice(6, i)] = line.slice(i + 1);  // "/proc/<pid> <target>"
                }
                const rows = ps.split("\n").map(l => l.trim().match(/^(\d+)\s+(\d+)\s+(\d+)\s(.*)$/)).filter(m => m && exe[m[1]])
                    .map(m => ({ pid: Number(m[1]), ppid: Number(m[2]), rssKiB: Number(m[3]), args: " " + m[4], exe: exe[m[1]] }));
                root.top = Rules.topProcesses(rows, 5);
            }
        }
    }
}
