import QtQuick
import Quickshell
import Quickshell.Io
import ".."

// A Lucide icon (assets/icons/lucide/<name>.svg) drawn in any colour: the SVG
// uses stroke="currentColor", which is swapped for the colour before rendering.
Item {
    id: root

    property string name
    property color color: "white"
    property real size: 16
    property real strokeWidth: 2
    property bool shadow: false     // dock icons: Theme.textShadow 1px below

    function source(c) {
        const svg = file.text();
        if (!svg)
            return "";
        // SVG wants #rrggbb, so the alpha goes on the item instead
        const hex = "#" + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
        return "data:image/svg+xml;utf8," + encodeURIComponent(svg.replace(/currentColor/g, hex)
            .replace(/stroke-width="2"/, `stroke-width="${strokeWidth}"`));
    }

    implicitWidth: size
    implicitHeight: size

    FileView {
        id: file
        path: root.name ? Quickshell.shellDir + "/assets/icons/lucide/" + root.name + ".svg" : ""
        blockLoading: true
    }

    Image {
        visible: root.shadow
        anchors.fill: parent
        anchors.topMargin: 1
        anchors.bottomMargin: -1
        opacity: Theme.textShadow.a * root.color.a
        sourceSize: Qt.size(root.size * 2, root.size * 2)
        smooth: true
        source: root.shadow ? root.source(Theme.textShadow) : ""
    }
    Image {
        anchors.fill: parent
        opacity: root.color.a
        sourceSize: Qt.size(root.size * 2, root.size * 2)
        smooth: true
        source: root.source(root.color)
    }
}
