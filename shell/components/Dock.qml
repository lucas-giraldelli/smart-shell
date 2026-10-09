import QtQuick
import QtQuick.Layouts
import ".."

// The dock bar (prototype: components/dock). Widgets sit in a row along its
// bottom edge; groups are separated by a thin line.
Rectangle {
    id: root

    implicitWidth: row.implicitWidth + Theme.padX * 2
    implicitHeight: Theme.size + Theme.padTop + Theme.padBottom
    radius: Theme.radius
    color: Theme.dockBg
    border.color: Theme.dockBorder

    RowLayout {
        id: row
        anchors.left: parent.left
        anchors.leftMargin: Theme.padX
        anchors.top: parent.top
        anchors.topMargin: Theme.padTop
        height: Theme.size
        spacing: Theme.gap

        Workspaces {
            Layout.alignment: Qt.AlignVCenter
            Layout.leftMargin: 4
            Layout.rightMargin: 4
        }

        Rectangle {
            Layout.alignment: Qt.AlignVCenter
            implicitWidth: 1
            implicitHeight: Theme.size * 0.7
            color: Theme.sep
        }

        Clock {}
    }
}
