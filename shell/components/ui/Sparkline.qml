import QtQuick
import QtQuick.Shapes
import "../.."

// Line chart of recent values (prototype: svg.tl-line, a 100x20 viewBox
// stretched to the box, 1.5px stroke). `max` = 0 scales to the data
// (network), otherwise a fixed ceiling (CPU %).
Shape {
    id: root

    property var values: []
    property real max: 0
    property color color: Theme.menuAccent

    implicitHeight: 20
    preferredRendererType: Shape.CurveRenderer

    readonly property real ceiling: max || Math.max(1, ...values)

    ShapePath {
        strokeColor: root.color
        strokeWidth: 1.5
        fillColor: "transparent"
        joinStyle: ShapePath.RoundJoin
        PathPolyline {
            path: root.values.map((v, i) => Qt.point(i / (root.values.length - 1) * root.width, (19 - v / root.ceiling * 17) / 20 * root.height))
        }
    }
}
