pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Services.Pipewire
import "../lib/rules.mjs" as Rules

// Output volume and device, microphone and per-app streams - the prototype's
// `audio` slice, read from and written to PipeWire.
Singleton {
    id: root

    readonly property PwNode sink: Pipewire.defaultAudioSink
    readonly property PwNode source: Pipewire.defaultAudioSource
    readonly property var sinks: Pipewire.nodes.values.filter(n => n.audio && n.isSink && !n.isStream)
    readonly property var streams: Pipewire.nodes.values.filter(n => n.audio && n.isSink && n.isStream)

    readonly property bool ready: !!sink?.audio
    readonly property int volume: Math.round((sink?.audio?.volume ?? 0) * 100)
    readonly property bool muted: sink?.audio?.muted ?? false
    readonly property int mic: Math.round((source?.audio?.volume ?? 0) * 100)
    readonly property bool micMuted: source?.audio?.muted ?? false
    readonly property string micName: source ? nameOf(source) : ""

    function nameOf(node) {
        return node.properties["application.name"] || node.nickname || node.description || node.name;
    }

    // a sink's second line: its full description, minus the nickname already shown
    function metaOf(node) {
        return node.nickname ? node.description.replace(` [${node.nickname}]`, "") : "";
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
