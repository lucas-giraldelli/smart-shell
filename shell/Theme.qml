pragma Singleton

import QtQuick
import Quickshell

// Design tokens - the prototype's "glass" theme (prototype/src/styles/base.css).
// Components read these and never hard-code colours or sizes.
Singleton {
    readonly property int size: Ui.size     // tile / icon size (dock settings)
    readonly property int padTop: 9
    readonly property int padBottom: 12
    readonly property int padX: 14
    readonly property int gap: 12
    readonly property int radius: 24
    readonly property real tileRadius: radius * 0.55 + 4
    readonly property int tilesGap: 8       // between the status tiles
    readonly property int edge: 8           // gap between the dock and the screen edge

    readonly property color dockBg: Qt.rgba(28 / 255, 28 / 255, 32 / 255, 0.56)
    // a faint shadow under dock text and icons, for light wallpapers
    // (prototype: --text-shadow 0 1px 2px / --icon-shadow 0 1px 1px, both .25)
    readonly property color textShadow: Qt.rgba(0, 0, 0, 0.25)
    readonly property color dockBorder: Qt.rgba(1, 1, 1, 0.28)
    readonly property color tileBg: Qt.rgba(1, 1, 1, 0.12)
    readonly property color tileBorder: Qt.rgba(1, 1, 1, 0.14)
    readonly property color text: "#ffffff"
    readonly property color sub: Qt.rgba(1, 1, 1, 0.72)
    readonly property color accent: "#7dd3fc"
    readonly property color sep: Qt.rgba(1, 1, 1, 0.22)
    readonly property color labelBg: Qt.rgba(20 / 255, 20 / 255, 24 / 255, 0.78) // hover tooltips
    readonly property color labelText: "#ffffff"
    readonly property color ringTrack: Qt.rgba(1, 1, 1, 0.16)

    // popovers (menus, control center)
    // the dock's glass, a little denser so text stays AA over light wallpapers
    // (blurred by Hyprland's blur_popups)
    readonly property color menuBg: Qt.rgba(28 / 255, 28 / 255, 32 / 255, 0.78)
    readonly property color menuLine: Qt.rgba(1, 1, 1, 0.28)
    readonly property color menuText: "#e4e4e7"
    readonly property color menuSub: "#c4c4cc"
    readonly property color menuFaint: "#b4b4bc"
    readonly property color menuSurface: Qt.rgba(1, 1, 1, 0.05)
    readonly property color menuHover: Qt.rgba(1, 1, 1, 0.08)
    readonly property color menuStrong: Qt.rgba(1, 1, 1, 0.13)
    readonly property color menuAccent: "#38bdf8"
    readonly property color menuWeekend: "#f0a3b0"
    readonly property color menuHoliday: "#fde68a"
    readonly property color menuShadow: Qt.rgba(0, 0, 0, 0.45)
    readonly property color warmFill: "#fb923c"     // night-light slider
    readonly property color upload: "#c084fc"       // network upload sparkline
    readonly property color offTint: Qt.rgba(251 / 255, 113 / 255, 133 / 255, 0.14) // muted icon button
    readonly property color healthyBg: Qt.rgba(74 / 255, 222 / 255, 128 / 255, 0.14)
    readonly property color knob: "#ffffff"
    readonly property color knobShadow: Qt.rgba(0, 0, 0, 0.45)

    // status identity, shared by every widget: ok · warn · crit · off
    readonly property color ok: "#4ade80"
    readonly property color warn: "#e0af68"
    readonly property color crit: "#f7768e"
    readonly property color off: "#71717a"
    function status(name) {
        return ({ ok, warn, crit, off })[name] ?? text;
    }
    // color-mix(in srgb, c p%, transparent)
    function mix(c, p) {
        return Qt.rgba(c.r, c.g, c.b, c.a * p);
    }
    // color-mix(in srgb, a p%, b): premultiplied, like the browser
    function blend(a, b, p) {
        const al = a.a * p + b.a * (1 - p);
        const ch = k => al ? (a[k] * a.a * p + b[k] * b.a * (1 - p)) / al : 0;
        return Qt.rgba(ch("r"), ch("g"), ch("b"), al);
    }

    // CSS `ease`, the prototype's default transition curve
    readonly property var ease: [0.25, 0.1, 0.25, 1, 1, 1]

    readonly property string font: "Inter"
    readonly property string mono: "monospace"
    // font.pixelSize is an int; fractional CSS sizes (11.5px) go through points (96 dpi)
    function px(size) {
        return size * 0.75;
    }
    // the prototype's body text: 500 13px Inter with tabular numbers where asked
    readonly property var tnum: ({ "tnum": 1 })
}
