import QtQuick
import "../.."
import ".."

// Section heading inside a popover (prototype: .sec in ui.css):
// 600 10.5px uppercase, .08em tracking, margin 12px 8px 4px (4px on top for a
// pane first heading).
Item {
    id: root

    property alias text: label.text
    property bool first: false
    property real gap: first ? 4 : 12       // margin-top

    width: parent?.width ?? 0
    implicitHeight: gap + label.implicitHeight + 4

    Label {
        id: label
        x: 8
        y: root.gap
        width: root.width - 16
        size: 10.5
        weight: Font.DemiBold
        letterSpacing: 10.5 * 0.08
        uppercase: true
        color: Theme.menuFaint
        elide: Text.ElideRight
    }
}
