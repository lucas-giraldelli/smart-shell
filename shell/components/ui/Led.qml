import QtQuick
import QtQuick.Effects
import "../.."

// Status led with a glow (prototype: .led in control-center.css); no glow
// when off.
Item {
    property string status: "ok"
    readonly property color tint: Theme.status(status)

    implicitWidth: 8
    implicitHeight: 8

    RectangularShadow {
        visible: parent.status !== "off"
        anchors.fill: parent
        blur: 6
        radius: 4
        color: parent.tint
    }
    Rectangle {
        anchors.fill: parent
        radius: 4
        color: parent.tint
    }
}
