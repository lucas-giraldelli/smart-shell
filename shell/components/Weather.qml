import QtQuick
import "../services"
import ".."
import "../lib/rules.mjs" as Rules
import "../lib/season.mjs" as Season

// Current weather (prototype: components/weather): the condition icon in its
// tone (the sun turns slowly) and the temperature; the condition and the
// temperature in °C and °F and the season (south of the equator by
// config.weather.lat) show on hover ("Céu limpo · 30°C · 86°F · Primavera"). Click opens the forecast. Hidden until the first forecast arrives.
Tile {
    id: root

    readonly property bool shown: Weather.loaded
    readonly property var look: Rules.weatherLook(Panes.i18n, Weather.current.code, Weather.current.isDay)

    // padding 0 11px (+ border), the 26px icon, gap 9, the temperature
    implicitWidth: 1 + 11 + 26 + 9 + temp.implicitWidth + 11 + 1
    open: forecast.open

    Tip {
        target: root
        text: `${root.look.label} · ${Weather.current.temp}°C · ${Math.round(Weather.current.temp * 9 / 5 + 32)}°F · ${I18n.t("weather.seasons." + Season.season(new Date(), Config.weather.lat))}`
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
