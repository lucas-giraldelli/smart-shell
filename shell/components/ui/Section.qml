import QtQuick
import "../.."
import ".."

// Section heading inside a popover (prototype: .sec in ui.css):
// 600 10.5px uppercase, .08em tracking, margin 12px 8px 4px (4px on top for a
// pane's first heading).
Item {
    id: root

    property alias text: label.text
    property bool first: false

    width: parent?.width ?? 0
    implicitHeight: (first ? 4 : 12) + label.implicitHeight + 4

    Label {
        id: label
        x: 8
        y: root.first ? 4 : 12
        width: root.width - 16
        size: 10.5
        weight: Font.DemiBold
        letterSpacing: 10.5 * 0.08
        uppercase: true
        color: Theme.menuFaint
        elide: Text.ElideRight
    }
}
