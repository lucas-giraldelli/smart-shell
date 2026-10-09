import QtQuick
import "../.."
import ".."

// A labelled segmented control (prototype: .seg-row in control-center.css,
// styled like the tab bar): padding 6px 10px, the label on the left, the
// options on the right; the current one on the strong surface.
Item {
    id: root

    property alias label: title.text
    property var options: []        // [{ value, text }]
    property string current
    signal picked(string value)

    width: parent?.width ?? 0
    height: 6 + seg.height + 6

    Label {
        id: title
        x: 10
        anchors.verticalCenter: parent.verticalCenter
        size: 12.5
        color: Theme.menuText
    }
    Rectangle {
        id: seg
        anchors.right: parent.right
        anchors.rightMargin: 10
        anchors.verticalCenter: parent.verticalCenter
        width: segRow.width + 4
        height: segRow.height + 4
        radius: 9
        color: Theme.menuSurface
        Row {
            id: segRow
            x: 2
            y: 2
            spacing: 2
            Repeater {
                model: root.options
                Rectangle {
                    id: option
                    required property var modelData
                    readonly property bool on: root.current === modelData.value
                    width: optLabel.implicitWidth + 20
                    height: optLabel.implicitHeight + 8
                    radius: 7
                    color: on ? Theme.menuStrong : "transparent"
                    Behavior on color { ColorAnimation { duration: 150 } }
                    Label {
                        id: optLabel
                        anchors.centerIn: parent
                        size: 11.5
                        color: option.on || optArea.containsMouse ? Theme.menuText : Theme.menuSub
                        text: option.modelData.text
                    }
                    MouseArea {
                        id: optArea
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: root.picked(option.modelData.value)
                    }
                }
            }
        }
    }
}
