import QtQuick
import QtQuick.Effects
import QtQuick.Shapes
import Quickshell
import Quickshell.Hyprland
import ".."

// A speech-bubble popover above its owner tile (prototype: .menu in
// components/ui/ui.css, placed by core/popover.js). It opens to the right of
// the tile with left edges aligned, slides back on screen if needed, and its
// tail points at the tile's centre. Only one popover is open at a time
// (Ui.popover); a click outside it or Esc closes it.
PopupWindow {
    id: root

    required property Item owner
    required property string name
    default property alias content: body.data
    property int bubbleWidth: 240
    property int padding: 6

    readonly property bool open: Ui.popover === name

    // core/popover.js
    readonly property int screenEdge: 12    // keep popovers this far from the screen edges
    readonly property int arrowInset: 18    // the arrow never gets closer than this to a corner
    readonly property int gap: 16           // between the tile and the bubble

    // room around the bubble for its shadow (0 16px 40px)
    readonly property int shadowX: 40
    readonly property int shadowTop: 24
    readonly property int shadowBottom: 56

    // placement, recomputed whenever the popover opens
    property real left: 0
    property real arrowX: 24

    function place() {
        const win = owner.QsWindow.window;
        if (!win)
            return;
        const tileLeft = owner.mapToItem(null, 0, 0).x + 1;
        let l = 0;
        l = Math.min(l, win.width - screenEdge - tileLeft - bubble.width);
        l = Math.max(l, screenEdge - tileLeft);
        left = l;
        arrowX = Math.min(Math.max(owner.width / 2 - l, arrowInset), bubble.width - arrowInset);
    }

    onOpenChanged: if (open) place()

    anchor.item: owner
    // the CSS positions the bubble from the tile's padding box, 1px inside its border
    anchor.rect.x: 1 + left - shadowX
    anchor.rect.y: 1 - gap + shadowBottom
    anchor.edges: Edges.Top | Edges.Left
    anchor.gravity: Edges.Top | Edges.Right
    anchor.adjustment: PopupAdjustment.None

    implicitWidth: bubble.width + shadowX * 2
    // whole pixels for the window; the bubble keeps its bottom (and tail) exact
    implicitHeight: Math.ceil(bubble.height + shadowTop + shadowBottom)
    color: "transparent"
    visible: open || frame.opacity > 0
    mask: Region { item: open ? bubble : null }

    HyprlandFocusGrab {
        // grab once the popup is mapped, or the compositor clears it at once
        active: root.open && root.backingWindowVisible
        windows: [root, root.owner.QsWindow.window]
        onCleared: if (root.open) Ui.closePopover()
    }

    Item {
        id: frame
        x: root.shadowX
        y: root.implicitHeight - root.shadowBottom - bubble.height
        width: bubble.width
        height: bubble.height
        focus: root.open

        Keys.onEscapePressed: Ui.closePopover()

        // opacity 0 / translateY(6px) scale(.98) -> shown, .16s, from the tail
        opacity: root.open ? 1 : 0
        transform: [
            Scale {
                origin.x: root.arrowX
                origin.y: frame.height
                xScale: root.open ? 1 : 0.98
                yScale: xScale
                Behavior on xScale { NumberAnimation { duration: 160; easing.type: Easing.Bezier; easing.bezierCurve: Theme.ease } }
            },
            Translate {
                y: root.open ? 0 : 6
                Behavior on y { NumberAnimation { duration: 160; easing.type: Easing.Bezier; easing.bezierCurve: Theme.ease } }
            }
        ]
        Behavior on opacity { NumberAnimation { duration: 160; easing.type: Easing.Bezier; easing.bezierCurve: Theme.ease } }

        RectangularShadow {
            anchors.fill: bubble
            offset.y: 16
            blur: 40
            radius: bubble.radius
            color: Theme.menuShadow
        }

        Rectangle {
            id: bubble
            width: root.bubbleWidth
            height: body.childrenRect.height + root.padding * 2 + 2
            radius: 14
            color: Theme.menuBg
            border.color: Theme.menuLine

            Item {
                id: body
                x: root.padding + 1
                y: root.padding + 1
                width: bubble.width - (root.padding + 1) * 2
                height: childrenRect.height
            }
        }

        // the tail: an outline triangle with a fill triangle on top
        Shape {
            preferredRendererType: Shape.CurveRenderer
            x: 1 + root.arrowX
            y: bubble.height - 1

            ShapePath {
                strokeWidth: -1
                fillColor: Theme.menuLine
                startX: -10; startY: 0
                PathLine { x: 10; y: 0 }
                PathLine { x: 0; y: 10 }
            }
            ShapePath {
                strokeWidth: -1
                fillColor: Theme.menuBg
                startX: -9; startY: -1
                PathLine { x: 9; y: -1 }
                PathLine { x: 0; y: 8 }
            }
        }
    }
}
