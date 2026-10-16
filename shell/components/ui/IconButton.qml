import QtQuick
import "../.."
import ".."

// Square icon button (prototype: .ib in ui.css). `interactive: false` is the
// static span.ib next to a slider; `off` is the muted state.
Rectangle {
    id: root

    property string icon
    property real iconSize: 16
    property bool interactive: true
    property bool off: false
    property bool flat: false               // no background until hovered
    readonly property alias hovered: area.containsMouse
    signal clicked

    implicitWidth: 30
    implicitHeight: 30
    radius: 9
    color: off ? Theme.offTint : area.containsMouse && interactive ? Theme.menuStrong : flat ? "transparent" : Theme.menuHover
    Behavior on color { ColorAnimation { duration: 150 } }

    Icon {
        anchors.centerIn: parent
        name: root.icon
        size: root.iconSize
        color: root.off ? Theme.crit : root.flat && !area.containsMouse ? Theme.menuSub : Theme.menuText
    }

    MouseArea {
        id: area
        anchors.fill: parent
        enabled: root.interactive
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: root.clicked()
    }
}
