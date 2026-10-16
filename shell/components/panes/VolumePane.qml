import QtQuick
import "../.."
import "../../services"
import "../ui"
import ".."

// Audio tab (prototype: control-center/panes/volume.js): output volume and
// device, microphone, per-app streams (each with its own mute) - all PipeWire.
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
    // devices: rename / hide on hover; hidden ones fold into a footer
    Repeater {
        model: Audio.sinks.filter(n => !Audio.custom(n).hidden || n === Audio.sink)
        DeviceRow {
            required property var modelData
            node: modelData
        }
    }
    Item {
        id: hiddenDevices
        readonly property var list: Audio.sinks.filter(n => Audio.custom(n).hidden && n !== Audio.sink)
        property bool open: false
        visible: list.length > 0
        width: parent.width
        height: visible ? toggle.height + (open ? hiddenList.height : 0) : 0

        Item {
            id: toggle
            width: parent.width
            height: 6 + 13.2 + 6
            Row {
                x: 10
                anchors.verticalCenter: parent.verticalCenter
                spacing: 6
                Icon {
                    anchors.verticalCenter: parent.verticalCenter
                    name: "chevron-right"
                    size: 12
                    color: toggleArea.containsMouse ? Theme.menuText : Theme.menuSub
                    rotation: hiddenDevices.open ? 90 : 0
                    Behavior on rotation { NumberAnimation { duration: 200 } }
                }
                Label {
                    size: 11
                    color: toggleArea.containsMouse ? Theme.menuText : Theme.menuSub
                    text: I18n.t("volume.hidden", { n: hiddenDevices.list.length })
                }
            }
            MouseArea {
                id: toggleArea
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: hiddenDevices.open = !hiddenDevices.open
            }
        }
        Column {
            id: hiddenList
            y: toggle.height
            width: parent.width
            visible: hiddenDevices.open
            Repeater {
                model: hiddenDevices.list
                DeviceRow {
                    required property var modelData
                    node: modelData
                    hiddenRow: true
                }
            }
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
            readonly property bool muted: Audio.appMuted(modelData)
            icon: muted ? "volume-x" : "volume-2"
            button: true
            off: muted
            label: Audio.nameOf(modelData.nodes[0])
            value: volume
            valueText: muted ? I18n.t("common.muted") : volume + "%"
            onMoved: v => Audio.setAppVolume(modelData, v)
            onButtonClicked: Audio.toggleAppMute(modelData)
        }
    }
}
