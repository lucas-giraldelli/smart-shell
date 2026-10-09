import QtQuick
import "../.."

// Toggle switch (prototype: .switch in ui.css).
Rectangle {
    id: root
    property bool on

    implicitWidth: 30
    implicitHeight: 18
    radius: 9
    color: on ? Theme.menuAccent : Theme.menuStrong
    Behavior on color { ColorAnimation { duration: 200 } }

    Rectangle {
        x: root.on ? 14 : 2
        y: 2
        width: 14
        height: 14
        radius: 7
        color: Theme.knob
        Behavior on x { NumberAnimation { duration: 200; easing.type: Easing.Bezier; easing.bezierCurve: Theme.ease } }
    }
}
