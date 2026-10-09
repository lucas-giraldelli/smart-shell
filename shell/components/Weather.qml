import QtQuick
import "../services"
import ".."
import "../lib/rules.mjs" as Rules

// Current weather (prototype: components/weather): the condition's icon in its
// tone (the sun turns slowly), temperature and summary. Click opens the
// forecast. Hidden until the first forecast arrives. A fixed width, so a
// longer condition never shifts the dock: the summary fits "Trovoada com
// granizo" and ellipsizes anything longer, with the full text on hover.
Tile {
    id: root

    readonly property bool shown: Weather.loaded
    readonly property var look: Rules.weatherLook(Panes.i18n, Weather.current.code, Weather.current.isDay)

    implicitWidth: 177
    open: forecast.open

    Tip {
        text: root.look.label
        shown: root.hovered && summary.implicitWidth > summary.width
    }

    MouseArea {
        anchors.fill: parent
        cursorShape: Qt.PointingHandCursor
        onClicked: forecast.open ? Ui.closePopover() : Ui.openPopover("weather")
    }

    Icon {
        x: 12
        y: 11.2
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
        Label {
            id: summary
            width: root.width - 47 - 12
            elide: Text.ElideRight
            text: root.look.label
            size: 11
            shadow: true
            color: Theme.sub
        }
    }

    Forecast {
        id: forecast
        owner: root
    }
}
