import QtQuick
import "../services"
import ".."
import "../lib/rules.mjs" as Rules

// Current weather (prototype: components/weather): the condition icon in its
// tone (the sun turns slowly) and the temperature; the condition shows on
// hover. Click opens the forecast. Hidden until the first forecast arrives.
Tile {
    id: root

    readonly property bool shown: Weather.loaded
    readonly property var look: Rules.weatherLook(Panes.i18n, Weather.current.code, Weather.current.isDay)

    // padding 0 11px (+ border), the 26px icon, gap 9, the temperature
    implicitWidth: 1 + 11 + 26 + 9 + temp.implicitWidth + 11 + 1
    open: forecast.open

    Tip {
        target: root
        text: root.look.label
        shown: root.hovered && !forecast.open
    }

    MouseArea {
        anchors.fill: parent
        cursorShape: Qt.PointingHandCursor
        onClicked: forecast.open ? Ui.closePopover() : Ui.openPopover("weather")
    }

    Icon {
        x: 12
        anchors.verticalCenter: parent.verticalCenter
        name: root.look.icon
        size: 26
        shadow: true
        color: root.look.color

        RotationAnimation on rotation {
            running: root.look.icon === "sun"
            from: 0
            to: 360
            duration: 22000
            loops: Animation.Infinite
            onRunningChanged: if (!running) parent.rotation = 0
        }
    }

    Column {
        x: 47
        anchors.verticalCenter: parent.verticalCenter

        Label {
            id: temp
            text: `${Weather.current.temp}°`
            size: 18
            weight: Font.DemiBold
            letterSpacing: -0.36
            tnum: true
            shadow: true
            color: Theme.text
        }
    }

    Forecast {
        id: forecast
        owner: root
    }
}
