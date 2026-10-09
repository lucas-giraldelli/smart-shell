import QtQuick
import QtQuick.Effects
import "../.."

// Range input (prototype: input.rng in ui.css): a 6px track filled up to the
// value, with a 16px white thumb. While dragged it keeps the user's value and
// ignores updates from outside.
Item {
    id: root

    property real value
    property real from: 0
    property real to: 100
    property real stepSize: 1
    property color fill: Theme.menuAccent
    readonly property bool pressed: area.pressed
    signal moved(real value)

    property real dragValue: value
    readonly property real shown: pressed ? dragValue : value
    readonly property real p: Math.max(0, Math.min(1, (shown - from) / (to - from)))

    implicitHeight: 6

    Rectangle {
        anchors.fill: parent
        radius: 3
        color: Theme.menuStrong
    }
    Rectangle {
        width: parent.width * root.p
        height: parent.height
        radius: 3
        color: root.fill
        // the fill ends in a hard edge, like the CSS gradient stop
        Rectangle {
            visible: parent.width > 3
            anchors.right: parent.right
            width: 3
            height: parent.height
            color: root.fill
        }
    }

    RectangularShadow {
        anchors.fill: thumb
        offset.y: 1
        blur: 4
        radius: 8
        color: Theme.knobShadow
    }
    Rectangle {
        id: thumb
        width: 16
        height: 16
        radius: 8
        x: root.p * (root.width - 16)
        anchors.verticalCenter: parent.verticalCenter
        color: Theme.knob
    }

    MouseArea {
        id: area
        anchors.fill: parent
        anchors.margins: -6
        cursorShape: Qt.PointingHandCursor
        function update(mx) {
            const f = Math.max(0, Math.min(1, (mx - 6 - 8) / (root.width - 16)));
            const v = Math.round((root.from + f * (root.to - root.from)) / root.stepSize) * root.stepSize;
            if (v !== root.dragValue || !pressed) {
                root.dragValue = v;
                root.moved(v);
            }
        }
        onPressed: mouse => update(mouse.x)
        onPositionChanged: mouse => update(mouse.x)
        onWheel: wheel => root.moved(Math.max(root.from, Math.min(root.to, root.value + (wheel.angleDelta.y > 0 ? 1 : -1) * root.stepSize * (root.stepSize === 1 ? 5 : 1))))
    }
}
