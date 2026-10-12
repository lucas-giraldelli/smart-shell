import QtQuick
import QtQuick.Effects
import ".."
import "../lib/fx.mjs" as Fx
import "../lib/weather-fx.mjs" as Wx
import "../services"

// The theme tint and particles, confined to the dock (prototype:
// components/fx): drawn behind the dock content and clipped to its rounded
// rectangle - snow drifting through it, or bats; else, with the weather in the
// dock on (Ui.weatherFx), the current weather (lib/weather-fx.mjs: rain,
// storms, fog, clouds, sun, stars; snow is the theme). Nothing is drawn
// outside the dock. 30 fps, paused while a fullscreen window is focused.
Item {
    id: root

    property real radius: 0
    // the theme effect wins; else the weather
    readonly property string effect: Theme.fx !== "" ? Theme.fx
        : Ui.weatherFx ? Wx.weatherFx(Weather.current.code, Weather.current.isDay) ?? "" : ""
    readonly property bool active: effect !== "" && visible && !Ui.calm
    onEffectChanged: canvas.start()

    layer.enabled: Theme.tint.a > 0 || effect !== ""
    layer.effect: MultiEffect {
        maskEnabled: true
        maskSource: shape
        maskThresholdMin: 0.5
        maskSpreadAtMin: 1
    }

    Rectangle {
        id: shape
        anchors.fill: parent
        radius: root.radius
        visible: false
        layer.enabled: true
    }

    // --tint: the dock share of the theme darkening
    Rectangle {
        anchors.fill: parent
        color: Theme.tint
    }

    Canvas {
        id: canvas
        anchors.fill: parent
        visible: root.effect !== ""
        renderStrategy: Canvas.Cooperative

        property var draw: null
        property real t: 0
        property real last: 0

        function start() {
            // the full-screen effect density, over the dock area
            const count = Math.max(12, Math.round(width * height / 4000));
            const make = Fx.effects[root.effect] ?? Wx[root.effect] ?? null;
            draw = width > 0 && height > 0 && make ? make({ width, height }, count) : null;
            last = 0;
            requestPaint();
        }
        Connections {
            target: Theme
            function onFxChanged() { canvas.start(); }
        }
        onWidthChanged: start()
        onHeightChanged: start()
        Component.onCompleted: start()

        onPaint: {
            const ctx = getContext("2d");
            ctx.reset();
            if (!draw)
                return;
            const now = Date.now() / 1000;
            const dt = last ? Math.min(now - last, 0.05) : 1 / 30;
            last = now;
            t += dt * 60;
            // nothing lands inside the dock: flakes fall through and start over
            draw(ctx, dt, t, { left: 0, right: 0, top: height });
        }

        Timer {
            running: root.active && canvas.draw !== null
            repeat: true
            interval: 33
            onTriggered: canvas.requestPaint()
        }
    }
}
