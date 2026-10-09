import QtQuick
import "../.."
import ".."

// Small text button with a leading icon (prototype: .btn-s in ui.css).
Rectangle {
    id: root

    property string icon
    property alias text: label.text
    signal clicked

    implicitWidth: row.implicitWidth + 20 + 2
    implicitHeight: label.implicitHeight + 12 + 2
    radius: 8
    color: area.containsMouse ? Theme.menuStrong : Theme.menuSurface
    border.color: Theme.menuStrong

    Row {
        id: row
        anchors.centerIn: parent
        spacing: 6
        Icon {
            visible: root.icon !== ""
            anchors.verticalCenter: parent.verticalCenter
            name: root.icon
            size: 13
            color: Theme.menuText
        }
        Label {
            id: label
            anchors.verticalCenter: parent.verticalCenter
            size: 11.5
            color: Theme.menuText
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
