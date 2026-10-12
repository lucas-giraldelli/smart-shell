import QtQuick
import "../.."
import ".."

// Small text button with a leading icon (prototype: .btn-s in ui.css).
Rectangle {
    id: root

    property string icon
    property alias text: label.text
    property bool active: false            // a toggle that is on (.btn-s.on): accent tint
    signal clicked

    implicitWidth: row.implicitWidth + 20 + 2
    implicitHeight: label.implicitHeight + 12 + 2
    radius: 8
    color: active ? Theme.mix(Theme.menuAccent, area.containsMouse ? 0.3 : 0.2) : area.containsMouse ? Theme.menuStrong : Theme.menuSurface
    border.color: active ? Theme.mix(Theme.menuAccent, 0.45) : Theme.menuStrong

    Row {
        id: row
        anchors.centerIn: parent
        spacing: 6
        Icon {
            visible: root.icon !== ""
            anchors.verticalCenter: parent.verticalCenter
            name: root.icon
            size: 13
            color: root.active ? Theme.menuAccent : Theme.menuText
        }
        Label {
            id: label
            anchors.verticalCenter: parent.verticalCenter
            size: 11.5
            color: root.active ? Theme.menuAccent : Theme.menuText
        }
    }

    MouseArea {
        id: area
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: root.clicked()
    }
}
