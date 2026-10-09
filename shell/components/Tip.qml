import QtQuick
import QtQuick.Shapes
import ".."

// Hover tooltip above a dock widget (prototype: .label in styles/base.css):
// centred 14px above its parent, fades and rises 4px in, hidden while the
// parent's popover is open. Put it inside the widget and bind `shown`.
Item {
    id: root

    property alias text: label.text
    property bool shown: false

    readonly property bool on: shown && text !== ""

    anchors.horizontalCenter: parent.horizontalCenter
    y: 1 - 14 - height + (on ? 0 : 4)
    width: label.implicitWidth + 20 + 2     // padding 5px 10px + 1px border
    height: label.implicitHeight + 10 + 2
    z: 30
    opacity: on ? 1 : 0
    visible: opacity > 0
    Behavior on opacity { NumberAnimation { duration: 150; easing.type: Easing.Bezier; easing.bezierCurve: Theme.ease } }
    Behavior on y { NumberAnimation { duration: 150; easing.type: Easing.Bezier; easing.bezierCurve: Theme.ease } }

    Rectangle {
        anchors.fill: parent
        radius: 8
        color: Theme.labelBg
        border.color: Theme.menuLine
    }
    Label {
        id: label
        anchors.centerIn: parent
        size: 12
        color: Theme.labelText
    }
    // the arrow: a 5px triangle under the centre
    Shape {
        x: root.width / 2
        y: root.height - 1
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
