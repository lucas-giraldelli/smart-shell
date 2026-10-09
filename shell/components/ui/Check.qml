import QtQuick
import "../.."
import ".."

// Square checkbox (prototype: .chk in control-center.css).
Rectangle {
    property bool on

    implicitWidth: 17
    implicitHeight: 17
    radius: 5
    color: on ? Theme.menuAccent : "transparent"
    border.width: on ? 0 : 1.5
    border.color: Theme.menuFaint
    Behavior on color { ColorAnimation { duration: 150 } }

    Icon {
        anchors.centerIn: parent
        visible: parent.on
        name: "check"
        size: 12
        strokeWidth: 3
        color: Theme.menuBg
    }
}
