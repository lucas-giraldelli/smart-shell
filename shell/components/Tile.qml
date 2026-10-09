import QtQuick
import ".."

// Every status widget is a tile (prototype: .tile in components/dock/dock.css):
// a rounded glass box the height of the dock's icons that lifts 2px on hover,
// except while its popover is open.
Rectangle {
    id: root

    property bool open: false               // its popover is showing
    readonly property bool hovered: hover.hovered

    implicitHeight: Theme.size
    radius: Theme.tileRadius
    color: Theme.tileBg
    border.color: Theme.tileBorder

    transform: Translate {
        y: root.hovered && !root.open ? -2 : 0
        Behavior on y { NumberAnimation { duration: 200; easing.type: Easing.Bezier; easing.bezierCurve: Theme.ease } }
    }

    HoverHandler {
        id: hover
    }
}
