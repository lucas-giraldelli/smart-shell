pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Services.Pipewire
import ".."
import Quickshell.Io
import "../lib/rules.mjs" as Rules

// Output volume and device, microphone and per-app streams - the prototype
// `audio` slice, read from and written to PipeWire.
Singleton {
    id: root

    readonly property PwNode sink: Pipewire.defaultAudioSink
    readonly property PwNode source: Pipewire.defaultAudioSource
    readonly property var sinks: Pipewire.nodes.values.filter(n => n.audio && n.isSink && !n.isStream)
    readonly property var streams: Pipewire.nodes.values.filter(n => n.audio && n.isSink && n.isStream)
    // one entry per app (application.name + process binary), however many
    // streams it plays: a browser opens one per tab
    readonly property var apps: {
        const byApp = new Map();
        for (const n of streams) {
            const key = `${n.properties["application.name"] ?? n.name}|${n.properties["application.process.binary"] ?? ""}`;
            if (!byApp.has(key))
                byApp.set(key, { key, nodes: [] });
            byApp.get(key).nodes.push(n);
        }
        return [...byApp.values()];
    }
    // The YouTube Music web app streams (config.pets.danceWith - the same
    // match the dancing pets use). Chromium MPRIS has no volume, so this is
    // the PipeWire stream itself: its process is the app audio service,
    // whose parent browser has --app=https://music.youtube.com on its command
    // line. The PWA runs with its own --user-data-dir, so its audio never
    // shares a stream with WhatsApp or other Chromium windows.
    property var ancestry: ({})     // stream pid -> the command lines of it and its parents
    readonly property var musicWords: (Config.petsConfig?.danceWith ?? []).map(s => String(s).toLowerCase())
    readonly property var musicApp: {
        const nodes = streams.filter(n => {
            const chain = (ancestry[n.properties["application.process.id"]] ?? "").toLowerCase();
            return musicWords.some(w => chain.includes(w));
        });
        return nodes.length ? { key: "music", nodes } : null;
    }
    readonly property bool musicMuted: musicApp ? musicApp.nodes.every(n => n.audio?.muted) : false
    function setMusicMuted(muted) {
        for (const n of musicApp?.nodes ?? [])
            if (n.audio)
                n.audio.muted = muted;
    }
    // stream properties arrive after the nodes, so look again until every
    // stream process is known
    Timer {
        running: root.streams.some(n => n.properties["application.process.id"] && !(n.properties["application.process.id"] in root.ancestry))
            || root.streams.some(n => !n.properties["application.process.id"])
        repeat: true
        triggeredOnStart: true
        interval: 2000
        onTriggered: lineage.refresh()
    }
    Process {
        id: lineage
        function refresh() {
            const pids = [...new Set(root.streams.map(n => n.properties["application.process.id"]).filter(Boolean))];
            if (!pids.length || running)
                return;
            // each pid: its command line and its ancestors, up to init
            command = ["sh", "-c", 'for p in "$@"; do printf "%s\t" "$p"; q=$p; while [ "$q" -gt 1 ] 2>/dev/null; do tr "\\0" " " < /proc/$q/cmdline 2>/dev/null; printf " | "; q=$(cut -d" " -f4 /proc/$q/stat 2>/dev/null); done; echo; done', "sh", ...pids.map(String)];
            running = true;
        }
        stdout: StdioCollector {
            onStreamFinished: {
                const map = {};
                for (const line of text.split("\n").filter(Boolean)) {
                    const i = line.indexOf("\t");
                    map[line.slice(0, i)] = line.slice(i + 1);
                }
                root.ancestry = map;
            }
        }
    }

    // an app volume: its loudest stream
    function appVolume(app) {
        return Math.round(Math.max(0, ...app.nodes.map(n => (n.audio?.volume ?? 0) * 100)));
    }
    function setAppVolume(app, v) {
        for (const n of app.nodes) {
            setStreamVolume(n, v);
            if (n.audio)
                n.audio.muted = false;
        }
    }
    // muted: all its streams are; PipeWire keeps each volume under the mute,
    // so unmuting brings the old level back
    function appMuted(app) {
        return app.nodes.every(n => n.audio?.muted);
    }
    function toggleAppMute(app) {
        const muted = !appMuted(app);
        for (const n of app.nodes)
            if (n.audio)
                n.audio.muted = muted;
    }

    readonly property bool ready: !!sink?.audio
    readonly property int volume: Math.round((sink?.audio?.volume ?? 0) * 100)
    readonly property bool muted: sink?.audio?.muted ?? false
    readonly property int mic: Math.round((source?.audio?.volume ?? 0) * 100)
    readonly property bool micMuted: source?.audio?.muted ?? false
    readonly property string micName: source ? nameOf(source) : ""

    // a stream app, by its desktop entry name ("Zen" -> "Zen Browser"),
    // or a device name
    // desktop entries load after start-up; bindings using nameOf() re-run then
    readonly property int entries: DesktopEntries.applications.values.length

    function nameOf(node) {
        const app = node.properties["application.name"];
        if (app && entries)
            return DesktopEntries.heuristicLookup(node.properties["application.process.binary"]?.replace(/-bin$/, "") || app)?.name || app;
        return node.nickname || node.description || node.name;
    }

    // an output friendly name and second line ("Odyssey G60SD", "HDMI · placa
    // de vídeo"), falling back to PipeWire description
    // a device description (its second line) and visibility, from
    // config.audio.devices; the name stays the device
    function custom(node) {
        return Config.audioDevices[node?.name] ?? {};
    }
    function sinkName(node) {
        return Rules.sinkName(I18n, Rules.sinkInfo(node.properties)) || node.description;
    }
    function sinkMeta(node) {
        return custom(node).label || Rules.sinkMeta(I18n, Rules.sinkInfo(node.properties)) || node.description;
    }
    function setDeviceLabel(node, label) {
        Config.setIn(["audio", "devices", node.name, "label"], label.trim() || undefined);
    }
    function hideDevice(node, hidden) {
        Config.setIn(["audio", "devices", node.name, "hidden"], hidden || undefined);
    }

    function iconOf(node) {
        const api = node.properties["device.api"] ?? "";
        if (api.startsWith("bluez"))
            return "headphones";
        return /hdmi|displayport/i.test(node.name) ? "monitor" : "speaker";
    }

    function setVolume(v) {
        if (!ready)
            return;
        sink.audio.muted = false;
        sink.audio.volume = Rules.clampVolume(v) / 100;
    }
    function step(dir) {
        setVolume(volume + dir * 5);
    }
    function toggleMute() {
        if (ready)
            sink.audio.muted = !sink.audio.muted;
    }
    function setMic(v) {
        if (!source?.audio)
            return;
        source.audio.muted = false;
        source.audio.volume = Rules.clampVolume(v) / 100;
    }
    function toggleMicMute() {
        if (source?.audio)
            source.audio.muted = !source.audio.muted;
    }
    function setSink(node) {
        Pipewire.preferredDefaultAudioSink = node;
    }
    function setStreamVolume(node, v) {
        if (node?.audio)
            node.audio.volume = Rules.clampVolume(v) / 100;
    }

    // audio properties only stay live for tracked nodes
    PwObjectTracker {
        objects: [root.sink, root.source, ...root.sinks, ...root.streams]
    }
}
