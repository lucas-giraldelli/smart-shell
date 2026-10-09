import QtQuick
import QtQuick.Controls
import "../.."

// A control-center tab's scrolling body (prototype: .cc .pane): fixed 306px,
// padding 8px 2px 2px, content scrolls inside with a thin scrollbar.
Flickable {
    id: root

    default property alias content: body.data

    width: parent?.width ?? 0
    height: parent?.height ?? 0
    contentHeight: body.height + 8 + 2
    clip: true
    boundsBehavior: Flickable.StopAtBounds

    Column {
        id: body
        x: 2
        y: 8
        width: root.width - 4
    }

    ScrollBar.vertical: ScrollBar {
        policy: root.contentHeight > root.height ? ScrollBar.AsNeeded : ScrollBar.AlwaysOff
        width: 6
        contentItem: Rectangle {
            radius: 3
            color: Theme.menuStrong
            opacity: parent.active ? 1 : 0     // shown while scrolling
            Behavior on opacity { NumberAnimation { duration: 200 } }
        }
    }
}
