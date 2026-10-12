import QtQuick
import QtQuick.Shapes
import Quickshell
import Quickshell.Hyprland
import ".."

// A speech-bubble popover above its owner tile (prototype: .menu in
// components/ui/ui.css, placed by core/popover.js). It opens to the right of
// the tile with left edges aligned, slides back on screen if needed, and its
// tail points at the tile centre. Only one popover is open at a time
// (Ui.popover); a click outside it or Esc closes it.
PopupWindow {
    id: root

    required property Item owner
    required property string name
    default property alias content: body.data
    property int bubbleWidth: 240
    property int padding: 6
    // beside its owner instead of above it, with no tail: to the left, or to
    // the right when there is no room on the left (the pet care menu, which
    // must not cover the pet)
    property bool side: false
    // takes the keyboard (text fields): an xdg_popup grab instead of the
    // Hyprland focus grab; the compositor closes it on a click outside
    property bool keyboard: false
    readonly property int sideGap: 24
    property bool sideRight: false

    // open on the screen it was opened on (Ui.popoverScreen) only
    readonly property bool open: Ui.popover === name
        && (!Ui.popoverScreen || owner.QsWindow.window?.screen?.name === Ui.popoverScreen)

    // core/popover.js
    readonly property int screenEdge: 12    // keep popovers this far from the screen edges
    readonly property int arrowInset: 18    // the arrow never gets closer than this to a corner
    readonly property int gap: 16           // between the tile and the bubble

    // room around the bubble (the window is a little larger than it)
    readonly property int shadowX: 40
    readonly property int shadowTop: 24
    readonly property int shadowBottom: 56

    // placement, recomputed whenever the popover opens
    property real left: 0
    property real arrowX: 24

    // the bubble outline: a rounded rect with the tail cut into its bottom
    // edge (prototype: outline() in core/popover.js)
    function outline(w, h, r, ax, tail, i) {
        const R = r - i, b = h - i, t = tail - i * 1.4142;
        return `M ${r} ${i} H ${w - r} A ${R} ${R} 0 0 1 ${w - i} ${r} V ${b - R} A ${R} ${R} 0 0 1 ${w - r} ${b}`
            + ` H ${ax + t} L ${ax} ${b + t} L ${ax - t} ${b} H ${r} A ${R} ${R} 0 0 1 ${i} ${b - R} V ${r} A ${R} ${R} 0 0 1 ${r} ${i} Z`;
    }

    function place() {
        const win = owner.QsWindow.window;
        if (!win)
            return;
        if (side) {
            sideRight = owner.mapToItem(null, 0, 0).x - sideGap - bubble.width < screenEdge;
            return;
        }
        const tileLeft = owner.mapToItem(null, 0, 0).x + 1;
        let l = 0;
        l = Math.min(l, win.width - screenEdge - tileLeft - bubble.width);
        l = Math.max(l, screenEdge - tileLeft);
        left = l;
        arrowX = Math.min(Math.max(owner.width / 2 - l, arrowInset), bubble.width - arrowInset);
    }

    onOpenChanged: if (open) place()

    anchor.item: owner
    // the CSS positions the bubble from the tile padding box, 1px inside its border
    anchor.rect.x: side ? (sideRight ? owner.width + sideGap : -sideGap - bubble.width) - shadowX : 1 + left - shadowX
    anchor.rect.y: side ? owner.height + shadowBottom : 1 - gap + shadowBottom
    anchor.edges: Edges.Top | Edges.Left
    anchor.gravity: Edges.Top | Edges.Right
    anchor.adjustment: PopupAdjustment.None

    implicitWidth: bubble.width + shadowX * 2
    // whole pixels for the window; the bubble keeps its bottom (and tail) exact
    implicitHeight: Math.ceil(bubble.height + shadowTop + shadowBottom)
    color: "transparent"
    visible: open || frame.opacity > 0
    mask: Region { item: open ? bubble : null }

    grabFocus: keyboard
    onBackingWindowVisibleChanged: if (keyboard && !backingWindowVisible && open) Ui.closePopover()

    HyprlandFocusGrab {
        // grab once the popup is mapped, or the compositor clears it at once
        active: root.open && root.backingWindowVisible && !root.keyboard
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

        // body and tail are one path, so the glass and its 1px border run
        // through the tail without a seam (the fill is the outline, the
        // border the outline minus the same shape 1px inside)
        Shape {
            preferredRendererType: Shape.CurveRenderer
            ShapePath {
                strokeWidth: -1
                fillColor: Theme.menuBg
                PathSvg { path: root.outline(bubble.width, bubble.height, 14, root.arrowX + 1, root.side ? 0 : 10, 0) }
            }
            ShapePath {
                strokeWidth: -1
                fillColor: Theme.menuLine
                fillRule: ShapePath.OddEvenFill
                PathSvg { path: root.outline(bubble.width, bubble.height, 14, root.arrowX + 1, root.side ? 0 : 10, 0) + " " + root.outline(bubble.width, bubble.height, 14, root.arrowX + 1, root.side ? 0 : 10, 1) }
            }
        }

        Item {
            id: bubble
            readonly property real radius: 14
            width: root.bubbleWidth
            height: body.childrenRect.height + root.padding * 2 + 2

            Item {
                id: body
                x: root.padding + 1
                y: root.padding + 1
                width: bubble.width - (root.padding + 1) * 2
                height: childrenRect.height
            }
        }

    }
}
