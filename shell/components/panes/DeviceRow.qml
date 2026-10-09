import QtQuick
import QtQuick.Layouts
import "../.."
import "../../services"
import "../ui"
import ".."

// An audio device in the volume tab (prototype: the sink rows of
// panes/volume.js): icon, name and connection, the default's radio; on hover
// a pencil edits its description - the second line - in place (Enter saves,
// Esc cancels, empty = the default) and an eye hides it. `hiddenRow` is the footer's version: only an eye
// to show it again.
MenuRow {
    id: root

    required property var node
    property bool hiddenRow: false
    property bool editing: false

    icon: Audio.iconOf(node)
    title: Audio.sinkName(node)
    meta: editing ? " " : Audio.sinkMeta(node)
    active: !hiddenRow && node === Audio.sink
    onClicked: if (!hiddenRow && !editing) Audio.setSink(node)

    // the inline description field, over the second line
    TextInput {
        id: field
        parent: root
        visible: root.editing
        x: 10 + 16 + 10
        y: 8 + 15
        width: root.width - x - 10 - trailWidth
        readonly property real trailWidth: 22 * 2 + 2 + 14 + 10 + 10
        text: Audio.sinkMeta(root.node)
        color: Theme.menuText
        selectionColor: Theme.menuAccent
        font { family: Theme.font; pixelSize: 11; weight: Font.Medium }
        clip: true
        Rectangle {
            z: -1
            anchors.fill: parent
            anchors.margins: -2
            anchors.leftMargin: -6
            radius: 6
            color: Theme.menuSurface
            border.color: Theme.menuAccent
        }
        onVisibleChanged: if (visible) { forceActiveFocus(); selectAll(); }
        Keys.onReturnPressed: {
            Audio.setDeviceLabel(root.node, text);
            root.editing = false;
        }
        Keys.onEnterPressed: Keys.onReturnPressed(event)
        Keys.onEscapePressed: root.editing = false
    }

    Row {
        spacing: 2
        opacity: root.hovered || root.editing || root.hiddenRow ? 1 : 0
        Behavior on opacity { NumberAnimation { duration: 150 } }
        IconButton {
            visible: !root.hiddenRow
            width: 22; height: 22; radius: 7; iconSize: 13
            flat: true
            icon: "pencil"
            onClicked: root.editing = !root.editing
        }
        IconButton {
            width: 22; height: 22; radius: 7; iconSize: 13
            flat: true
            icon: root.hiddenRow ? "eye" : "eye-off"
            onClicked: Audio.hideDevice(root.node, !root.hiddenRow)
        }
    }
    Item { width: 2; height: 1 }
    Radio {
        visible: !root.hiddenRow
        on: root.active
    }
}
