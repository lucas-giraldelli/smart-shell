import QtQuick
import QtQuick.Shapes
import Quickshell
import ".."

// Hover tooltip above a dock widget (prototype: .label in styles/base.css):
// the popovers' glass, centred 14px above `target`, fading and rising 4px in.
// It is its own popup surface (blurred by Hyprland's blur_popups), so nothing
// on the dock - its bounds, a magnified icon - can clip it. Sized to the text
// up to 360px, then elided.
PopupWindow {
    id: root

    required property Item target
    property alias text: label.text
    property bool shown: false

    readonly property bool on: shown && text !== "" && target.visible
    readonly property int maxWidth: 360

    // the box, plus the 5px arrow and 4px for the rise
    implicitWidth: Math.ceil(Math.min(label.implicitWidth, maxWidth - 22) + 20 + 2)
    implicitHeight: Math.ceil(label.implicitHeight + 10 + 2 + 5 + 4)
    color: "transparent"
    visible: on || content.opacity > 0
    mask: Region {}

    anchor.item: target
    anchor.rect.x: target.width / 2
    anchor.rect.y: 1 - 14 + 5 + 4
    anchor.edges: Edges.Top
    anchor.gravity: Edges.Top
    anchor.adjustment: PopupAdjustment.Slide

    Item {
        id: content
        width: parent.width
        height: parent.height - 4
        y: root.on ? 0 : 4
        opacity: root.on ? 1 : 0
        Behavior on opacity { NumberAnimation { duration: 150; easing.type: Easing.Bezier; easing.bezierCurve: Theme.ease } }
        Behavior on y { NumberAnimation { duration: 150; easing.type: Easing.Bezier; easing.bezierCurve: Theme.ease } }

        Rectangle {
            id: box
            width: parent.width
            height: parent.height - 5
            radius: 8
            color: Theme.labelBg
            border.color: Theme.menuLine
        }
        Label {
            id: label
            x: 11
            width: Math.min(implicitWidth, root.maxWidth - 22)
            anchors.verticalCenter: box.verticalCenter
            elide: Text.ElideRight
            size: 12
            color: Theme.labelText
        }
        // the arrow: a 5px triangle under the centre
        Shape {
            x: box.width / 2
            y: box.height - 1
            preferredRendererType: Shape.CurveRenderer
            ShapePath {
                strokeWidth: -1
                fillColor: Theme.labelBg
                startX: -5; startY: 0
                PathLine { x: 5; y: 0 }
                PathLine { x: 0; y: 5 }
            }
        }
    }
}
