pragma Singleton

import QtQuick
import Quickshell

// Design tokens - the prototype's themes (prototype/src/styles/base.css and
// styles/themes). Components read these and never hard-code colours or sizes.
Singleton {
    readonly property int size: Ui.size     // tile / icon size (dock settings)
    readonly property int padTop: 9
    readonly property int padBottom: v("padBottom")
    readonly property int padX: 14
    readonly property int gap: 12
    readonly property int radius: v("radius")
    readonly property real tileRadius: radius * 0.55 + 4
    readonly property int tilesGap: 8       // between the status tiles
    readonly property int edge: 8           // gap between the dock and the screen edge

    // The themes (prototype/src/styles/themes/*.css): "glass" is the base and
    // every other theme overrides some tokens. Colours are [r, g, b, a] or
    // "#rrggbb". Picked in the dock settings, saved as config.theme. Not
    // ported: --tint (the shell doesn't draw the wallpaper) and per-theme
    // --blur (Hyprland's layer rule blurs every theme).
    readonly property var base: ({
        radius: 24, padBottom: 12, reflection: 0.18,
        dockBg: [28, 28, 32, 0.56], dockGradient: null, dockBorder: [255, 255, 255, 0.28],
        // --shadow: 0 18px 50px rgba(0, 0, 0, .35), inset 0 1px 0 rgba(255, 255, 255, .25)
        dockShadow: [0, 0, 0, 0.35], dockShadowY: 18, dockShadowBlur: 50, dockInset: [255, 255, 255, 0.25],
        tileBg: [255, 255, 255, 0.12], tileBorder: [255, 255, 255, 0.14],
        text: "#ffffff", sub: [255, 255, 255, 0.72], accent: "#7dd3fc", dot: [255, 255, 255, 0.9],
        sep: [255, 255, 255, 0.22], ringTrack: [255, 255, 255, 0.16],
        // a faint shadow under dock text and icons, for light wallpapers
        // (--text-shadow 0 1px 2px / --icon-shadow 0 1px 1px, both .25)
        textShadow: [0, 0, 0, 0.25],
        // app icons: drop-shadow(0 5px 8px rgba(0, 0, 0, .35)); neon glows
        iconShadow: [0, 0, 0, 0.35], iconShadowY: 5,
        // tooltips and popovers: the dock's glass, a little denser so text
        // stays AA over light wallpapers (blurred by Hyprland's blur_popups)
        labelBg: [28, 28, 32, 0.78], labelText: "#ffffff",
        menuBg: [28, 28, 32, 0.78], menuLine: [255, 255, 255, 0.28],
        menuText: "#e4e4e7", menuSub: "#c4c4cc", menuFaint: "#b4b4bc",
        menuSurface: [255, 255, 255, 0.05], menuHover: [255, 255, 255, 0.08], menuStrong: [255, 255, 255, 0.13],
        menuAccent: "#38bdf8", menuWeekend: "#f0a3b0", menuHoliday: "#fde68a"
    })
    readonly property var themes: ({
        glass: {},
        midnight: {
            dockBg: [10, 12, 30, 0.70], dockBorder: [140, 150, 255, 0.28], dockShadow: [0, 0, 20, 0.55], dockShadowY: 20, dockShadowBlur: 60,
            dockInset: [160, 170, 255, 0.18],
            tileBg: [120, 130, 255, 0.10], tileBorder: [140, 150, 255, 0.18], accent: "#a5b4fc", dot: "#a5b4fc", reflection: 0.32,
            menuBg: [12, 14, 36, 0.95], menuLine: [140, 150, 255, 0.25],
            menuSurface: [120, 130, 255, 0.07], menuHover: [140, 150, 255, 0.12], menuStrong: [140, 150, 255, 0.2], menuAccent: "#a5b4fc"
        },
        aqua: {
            dockBg: [0, 0, 0, 0], dockBorder: [0, 0, 0, 0], dockShadow: [0, 0, 0, 0], dockInset: [0, 0, 0, 0],
            padBottom: 20, reflection: 0.42, radius: 6,
            tileBg: [12, 24, 48, 0.55], tileBorder: [255, 255, 255, 0.35], dot: "#bfe9ff", accent: "#5ac8fa",
            menuBg: [14, 30, 54, 0.93], menuLine: [191, 233, 255, 0.45],
            menuSurface: [191, 233, 255, 0.07], menuHover: [191, 233, 255, 0.12], menuStrong: [191, 233, 255, 0.2], menuAccent: "#5ac8fa"
        },
        neon: {
            dockBg: [8, 4, 22, 0.78], dockBorder: [0, 255, 240, 0.65], dockShadow: [0, 255, 240, 0.45], dockShadowY: 0, dockShadowBlur: 14,
            dockInset: [255, 0, 200, 0.12],
            tileBg: [0, 255, 240, 0.06], tileBorder: [255, 0, 200, 0.35], accent: "#00fff0", dot: "#ff3bd4", sep: [0, 255, 240, 0.35], reflection: 0.25,
            iconShadow: [0, 255, 240, 0.45], iconShadowY: 0,
            menuBg: [10, 4, 26, 0.96], menuLine: [0, 255, 240, 0.5],
            menuSurface: [0, 255, 240, 0.05], menuHover: [255, 0, 200, 0.1], menuStrong: [0, 255, 240, 0.18], menuAccent: "#00fff0"
        },
        paper: {
            dockBg: [248, 243, 232, 0.97], dockBorder: "#ddd2bd", dockShadow: [70, 50, 20, 0.28], dockShadowY: 14, dockShadowBlur: 34,
            dockInset: "#ffffff",
            tileBg: "#fffdf8", tileBorder: "#e6dccb", text: "#2b2620", sub: "#6f6555", accent: "#c2410c", dot: "#2b2620",
            textShadow: [0, 0, 0, 0], sep: "#d9ceb8", reflection: 0, radius: 18, labelBg: [43, 38, 32, 0.9], ringTrack: "#ece3d2",
            menuBg: [251, 247, 238, 0.98], menuLine: "#ddd2bd", menuText: "#2b2620", menuSub: "#6f6555", menuFaint: "#776e5f",
            menuSurface: [43, 38, 32, 0.05], menuHover: [43, 38, 32, 0.08], menuStrong: [43, 38, 32, 0.14],
            menuAccent: "#c2410c", menuWeekend: "#be123c", menuHoliday: "#b45309"
        },
        canarinho: {
            dockBg: [0, 113, 56, 0.79], dockGradient: [[0, 130, 64, 0.78], [0, 96, 48, 0.80]], dockBorder: [255, 223, 0, 0.7],
            dockShadow: [0, 40, 10, 0.45], dockInset: [255, 240, 120, 0.35],
            tileBg: [0, 39, 118, 0.38], tileBorder: [255, 223, 0, 0.35], accent: "#ffdf00", dot: "#ffdf00", sep: [255, 223, 0, 0.4], reflection: 0.2,
            menuBg: [0, 70, 35, 0.96], menuLine: [255, 223, 0, 0.55], menuText: "#f7fbe8", menuSub: "#c9dcb0", menuFaint: "#8fb27c",
            menuSurface: [0, 39, 118, 0.35], menuHover: [255, 223, 0, 0.1], menuStrong: [255, 223, 0, 0.22], menuAccent: "#ffdf00"
        },
        snowy: {
            dockBg: [200, 225, 255, 0.20], dockBorder: [230, 245, 255, 0.55], dockShadow: [0, 10, 40, 0.55], dockShadowY: 20, dockShadowBlur: 60,
            dockInset: [255, 255, 255, 0.5],
            tileBg: [220, 238, 255, 0.14], tileBorder: [230, 245, 255, 0.3], accent: "#bae6fd", dot: "#e0f2fe", reflection: 0.3,
            menuBg: [14, 30, 66, 0.94], menuLine: [230, 245, 255, 0.45],
            menuSurface: [220, 238, 255, 0.07], menuHover: [220, 238, 255, 0.12], menuStrong: [220, 238, 255, 0.2], menuAccent: "#bae6fd"
        },
        halloween: {
            dockBg: [26, 8, 32, 0.78], dockBorder: [255, 140, 0, 0.55], dockShadow: [255, 110, 0, 0.35], dockShadowY: 0, dockShadowBlur: 30,
            dockInset: [255, 170, 60, 0.25],
            tileBg: [255, 120, 0, 0.09], tileBorder: [255, 140, 0, 0.28], accent: "#ff8c1a", dot: "#ff8c1a", sep: [255, 140, 0, 0.35], reflection: 0.25,
            menuBg: [26, 8, 32, 0.96], menuLine: [255, 140, 0, 0.5],
            menuSurface: [255, 120, 0, 0.07], menuHover: [255, 140, 0, 0.12], menuStrong: [255, 140, 0, 0.22], menuAccent: "#ff8c1a"
        }
    })
    readonly property string theme: themes[Ui.theme] ? Ui.theme : "glass"
    function v(key) {
        const own = themes[theme][key];
        return own !== undefined ? own : base[key];
    }
    function rgba(x) {
        return Array.isArray(x) ? Qt.rgba(x[0] / 255, x[1] / 255, x[2] / 255, x[3]) : Qt.color(x);
    }
    function c(key) {
        return rgba(v(key));
    }
    // decorations drawn by the dock in one theme only
    readonly property bool shelf: theme === "aqua"
    readonly property bool cobweb: theme === "halloween"
    readonly property bool snowCap: theme === "snowy"

    readonly property color dockBg: c("dockBg")
    readonly property var dockGradient: v("dockGradient")?.map(rgba) ?? null
    readonly property color dockBorder: c("dockBorder")
    readonly property color dockShadow: c("dockShadow")
    readonly property real dockShadowY: v("dockShadowY")
    readonly property real dockShadowBlur: v("dockShadowBlur")
    readonly property color dockInset: c("dockInset")
    readonly property color textShadow: c("textShadow")
    readonly property color iconShadow: c("iconShadow")
    readonly property real iconShadowY: v("iconShadowY")
    readonly property color tileBg: c("tileBg")
    readonly property color tileBorder: c("tileBorder")
    readonly property color text: c("text")
    readonly property color sub: c("sub")
    readonly property color accent: c("accent")
    readonly property color sep: c("sep")
    readonly property color dot: c("dot")                   // running app indicator
    readonly property real reflection: v("reflection")      // app icons' mirror (--refl)
    readonly property color labelBg: c("labelBg")
    readonly property color labelText: c("labelText")
    readonly property color ringTrack: c("ringTrack")

    // popovers (menus, control center)
    readonly property color menuBg: c("menuBg")
    readonly property color menuLine: c("menuLine")
    readonly property color menuText: c("menuText")
    readonly property color menuSub: c("menuSub")
    readonly property color menuFaint: c("menuFaint")
    readonly property color menuSurface: c("menuSurface")
    readonly property color menuHover: c("menuHover")
    readonly property color menuStrong: c("menuStrong")
    readonly property color menuAccent: c("menuAccent")
    readonly property color menuWeekend: c("menuWeekend")
    readonly property color menuHoliday: c("menuHoliday")
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
