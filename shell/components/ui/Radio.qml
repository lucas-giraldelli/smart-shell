import QtQuick
import "../.."

// Radio dot (prototype: .radio in ui.css); filled while its row is active.
Rectangle {
    property bool on

    implicitWidth: 14
    implicitHeight: 14
    radius: 7
    color: "transparent"
    border.width: 2
    border.color: on ? Theme.menuAccent : Theme.menuFaint

    Rectangle {
        anchors.centerIn: parent
        visible: parent.on
        width: 7
        height: 7
        radius: 3.5
        color: Theme.menuAccent
    }
}
