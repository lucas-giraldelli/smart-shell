import QtQuick
import Quickshell
import Quickshell.Io

// A Lucide icon (assets/icons/lucide/<name>.svg) drawn in any colour: the SVG
// uses stroke="currentColor", which is swapped for the colour before rendering.
Item {
    id: root

    property string name
    property color color: "white"
    property real size: 16
    property real strokeWidth: 2

    implicitWidth: size
    implicitHeight: size

    FileView {
        id: file
        path: root.name ? Quickshell.shellDir + "/assets/icons/lucide/" + root.name + ".svg" : ""
        blockLoading: true
    }

    Image {
        anchors.fill: parent
        // SVG wants #rrggbb, so the alpha goes on the item instead
        opacity: root.color.a
        sourceSize: Qt.size(root.size * 2, root.size * 2)
        smooth: true
        source: {
            const svg = file.text();
            if (!svg)
                return "";
            const hex = "#" + [root.color.r, root.color.g, root.color.b]
                .map(c => Math.round(c * 255).toString(16).padStart(2, "0")).join("");
            return "data:image/svg+xml;utf8," + encodeURIComponent(svg.replace(/currentColor/g, hex)
                .replace(/stroke-width="2"/, `stroke-width="${root.strokeWidth}"`));
        }
    }
}
