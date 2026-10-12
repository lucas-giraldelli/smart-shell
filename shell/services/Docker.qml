pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Io

// Docker service state and containers - the prototype `docker` slice
// (prototype/src/data/snapshot.js documents the shape): `systemctl is-active
// docker`, `docker inspect` of every container and `docker stats` (memory in
// MiB). A container `state` is running | paused | restarting | exited;
// `exitCode` matters only when exited; `project` is its compose project
// ("" = none), `restart` its restart policy, `health` healthy | unhealthy | "".
Singleton {
    id: root

    property bool running: false
    property var containers: []
    property bool loaded: false

    // UTF-8 safe separators between the sections of one poll
    readonly property string script: "systemctl is-active --quiet docker && echo up || echo down; echo '--ps'; "
        + "ids=$(docker ps -aq 2>/dev/null); [ -n \"$ids\" ] && docker inspect -f '{{.Name}}\t{{.State.Status}}\t{{.State.ExitCode}}\t"
        + "{{if .State.Health}}{{.State.Health.Status}}{{end}}\t{{index .Config.Labels \"com.docker.compose.project\"}}\t"
        + "{{.HostConfig.RestartPolicy.Name}}' $ids 2>/dev/null; echo '--stats'; "
        + "docker stats --no-stream --format '{{.Name}}\t{{.MemUsage}}' 2>/dev/null"

    function refresh() {
        if (!poll.running)
            poll.running = true;
    }

    // "63.6MiB / 47GiB" -> 63.6
    function toMiB(usage) {
        const m = usage.split("/")[0].trim().match(/^([\d.]+)\s*([KMGT]?i?B)$/);
        if (!m)
            return 0;
        const unit = { B: 1 / 1048576, KiB: 1 / 1024, kB: 1 / 1024, MiB: 1, MB: 1, GiB: 1024, GB: 1024, TiB: 1048576 }[m[2]] ?? 1;
        return Number(m[1]) * unit;
    }

    function parse(text) {
        const [head, rest] = text.split("--ps\n");
        const [ps, stats] = (rest ?? "").split("--stats\n");
        running = head.trim() === "up";
        const mem = {};
        for (const line of (stats ?? "").split("\n").filter(Boolean)) {
            const [name, usage] = line.split("\t");
            mem[name] = toMiB(usage ?? "");
        }
        containers = (ps ?? "").split("\n").filter(Boolean).map(line => {
            const [slashName, rawState, exitCode, health, project, restart] = line.split("\t");
            const name = slashName.replace(/^\//, "");
            // created / dead / removing count as stopped
            const state = ["running", "paused", "restarting"].includes(rawState) ? rawState : "exited";
            return {
                name,
                state,
                exitCode: state === "exited" ? Number(exitCode) || 0 : 0,
                memMiB: mem[name] ?? 0,
                health: health ?? "",
                project: project ?? "",
                restart: restart || "no"
            };
        });
        loaded = true;
    }

    // start or stop one container, then poll again
    function toggle(name) {
        const c = containers.find(c => c.name === name);
        if (!c)
            return;
        action.command = ["docker", c.state === "running" ? "stop" : "start", name];
        action.running = true;
    }

    Timer {
        running: true
        repeat: true
        triggeredOnStart: true
        interval: 5000
        onTriggered: root.refresh()
    }

    Process {
        id: poll
        command: ["sh", "-c", root.script]
        stdout: StdioCollector {
            onStreamFinished: root.parse(text)
        }
    }

    Process {
        id: action
        onExited: root.refresh()
    }
}
