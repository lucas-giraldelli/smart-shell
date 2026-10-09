import QtQuick
import QtQuick.Effects
import ".."

// A CSS box-shadow: blurred, offset, and drawn only outside the box, so it
// never darkens a translucent surface above it. Fill the shadowed item.
Item {
    id: root

    property color color: "transparent"
    property real offsetY: 0
    property real blur: 0
    property real radius: 0
    readonly property real margin: blur * 1.5 + Math.abs(offsetY)

    Item {
        id: shade
        x: -root.margin
        y: -root.margin
        width: root.width + root.margin * 2
        height: root.height + root.margin * 2
        visible: root.color.a > 0
        layer.enabled: visible
        layer.effect: MultiEffect {
            maskEnabled: true
            maskInverted: true
            maskSource: cutout
            maskThresholdMin: 0.5
            maskSpreadAtMin: 1
        }
        RectangularShadow {
            x: root.margin
            y: root.margin
            width: root.width
            height: root.height
            offset.y: root.offsetY
            blur: root.blur
            radius: root.radius
            color: root.color
        }
    }
    Item {
        id: cutout
        x: shade.x
        y: shade.y
        width: shade.width
        height: shade.height
        visible: false
        layer.enabled: true
        Rectangle {
            x: root.margin
            y: root.margin
            width: root.width
            height: root.height
            radius: root.radius
        }
    }
}
