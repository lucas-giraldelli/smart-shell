import QtQuick
import "../.."
import "../../services"
import "../ui"

// Audio tab (prototype: control-center/panes/volume.js): output volume and
// device, microphone, per-app streams - all PipeWire.
PaneScroll {
    Section { first: true; text: I18n.t("volume.output") }
    Slider {
        icon: Audio.muted ? "volume-x" : "volume-2"
        button: true
        off: Audio.muted
        label: Audio.sink ? Audio.sinkName(Audio.sink) : "—"
        value: Audio.volume
        valueText: Audio.muted ? I18n.t("common.muted") : Audio.volume + "%"
        onMoved: v => Audio.setVolume(v)
        onButtonClicked: Audio.toggleMute()
    }
    Repeater {
        model: Audio.sinks
        MenuRow {
            id: sinkRow
            required property var modelData
            icon: Audio.iconOf(modelData)
            title: Audio.sinkName(modelData)
            meta: Audio.sinkMeta(modelData)
            active: modelData === Audio.sink
            onClicked: Audio.setSink(modelData)
            Radio { on: sinkRow.active }
        }
    }

    Section { text: I18n.t("volume.input") }
    Slider {
        icon: "mic"
        button: true
        off: Audio.micMuted
        label: Audio.micName
        value: Audio.mic
        valueText: Audio.micMuted ? I18n.t("common.muted") : Audio.mic + "%"
        onMoved: v => Audio.setMic(v)
        onButtonClicked: Audio.toggleMicMute()
    }

    Section { text: I18n.t("volume.apps") }
    Repeater {
        // one slider per app, setting all its streams together
        model: Audio.apps
        Slider {
            required property var modelData
            readonly property int volume: Audio.appVolume(modelData)
            icon: "app-window"
            label: Audio.nameOf(modelData.nodes[0])
            value: volume
            valueText: volume + "%"
            onMoved: v => Audio.setAppVolume(modelData, v)
        }
    }
}
