pragma Singleton

import QtQuick
import Quickshell

// Design tokens - the prototype's "glass" theme (prototype/src/styles/base.css).
// Components read these and never hard-code colours or sizes.
Singleton {
    readonly property int size: 52          // tile / icon size
    readonly property int padTop: 9
    readonly property int padBottom: 12
    readonly property int padX: 14
    readonly property int gap: 12
    readonly property int radius: 24
    readonly property int edge: 14          // gap between the dock and the screen edge

    readonly property color dockBg: Qt.rgba(28 / 255, 28 / 255, 32 / 255, 0.42)
    readonly property color dockBorder: Qt.rgba(1, 1, 1, 0.28)
    readonly property color tileBg: Qt.rgba(1, 1, 1, 0.12)
    readonly property color tileBorder: Qt.rgba(1, 1, 1, 0.14)
    readonly property color text: "#ffffff"
    readonly property color sub: Qt.rgba(1, 1, 1, 0.72)
    readonly property color accent: "#7dd3fc"
    readonly property color sep: Qt.rgba(1, 1, 1, 0.22)

    readonly property string font: "Inter"
}
