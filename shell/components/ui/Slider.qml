import QtQuick
import "../.."
import ".."

// Labelled slider (prototype: slider() in ui.js, .slide in ui.css): an icon
// button (or a static icon), then the name and value over a range.
Item {
    id: root

    property string icon
    property bool button: false
    property bool off: false
    property alias label: name.text
    property alias valueText: valueLabel.text
    property alias value: range.value
    property alias from: range.from
    property alias to: range.to
    property alias stepSize: range.stepSize
    property bool warm: false
    signal moved(real value)
    signal buttonClicked

    width: parent?.width ?? 0
    implicitHeight: 42

    IconButton {
        x: 8
        y: 6
        icon: root.icon
        interactive: root.button
        off: root.off
        onClicked: root.buttonClicked()
    }

    Item {
        x: 48
        width: root.width - 48 - 8
        height: 14.4 + 7 + 6
        anchors.verticalCenter: parent.verticalCenter

        Label {
            id: name
            width: parent.width - valueLabel.implicitWidth - 8
            size: 12
            color: Theme.menuText
            elide: Text.ElideRight
        }
        Label {
            id: valueLabel
            anchors.right: parent.right
            size: 12
            weight: Font.DemiBold
            tnum: true
            color: Theme.menuSub
        }
        Range {
            id: range
            y: 14.4 + 7
            width: parent.width
            fill: root.warm ? Theme.warmFill : Theme.menuAccent
            onMoved: v => root.moved(v)
        }
    }
}
