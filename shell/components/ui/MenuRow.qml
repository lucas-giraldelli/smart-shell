import QtQuick
import QtQuick.Layouts
import "../.."
import ".."

// Clickable popover row: icon, title (+ meta line), trailing control
// (prototype: row() in components/ui/ui.js, .row in ui.css).
Rectangle {
    id: root

    property string icon            // Lucide name
    property string iconSource      // or any image (tray menus)
    property string title
    property string meta
    property color metaColor: Theme.menuSub
    property bool active: false
    property bool enabled: true
    default property alias trailing: trail.data
    signal clicked

    implicitWidth: parent?.width ?? 200
    // from the parts, not the layout: Qt Layouts round to whole pixels
    implicitHeight: Math.max(texts.implicitHeight, trail.implicitHeight, 16) + 16
    radius: 9
    color: area.containsMouse && enabled ? Theme.menuHover : "transparent"
    opacity: enabled ? 1 : 0.45

    RowLayout {
        id: layout
        anchors.fill: parent
        anchors.leftMargin: 10
        anchors.rightMargin: 10
        spacing: 10

        Icon {
            visible: root.icon !== ""
            name: root.icon
            size: 16
            color: root.active ? Theme.menuAccent : Theme.menuSub
        }

        Image {
            visible: root.iconSource !== ""
            Layout.preferredWidth: 16
            Layout.preferredHeight: 16
            sourceSize: Qt.size(32, 32)
            source: root.iconSource
        }

        Column {
            id: texts
            Layout.fillWidth: true
            Label {
                width: parent.width
                text: root.title
                elide: Text.ElideRight
                color: Theme.menuText
                size: 12.5
            }
            Label {
                visible: root.meta !== ""
                width: parent.width
                text: root.meta
                elide: Text.ElideRight
                color: root.metaColor
                size: 11
            }
        }

        Row {
            id: trail
            Layout.alignment: Qt.AlignVCenter
        }
    }

    MouseArea {
        id: area
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: root.enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
        onClicked: if (root.enabled) root.clicked()
    }
}
