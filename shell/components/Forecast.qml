import QtQuick
import "../services"
import ".."
import "ui"
import "../lib/rules.mjs" as Rules

// Forecast popover of the weather tile (prototype: components/weather/
// forecast.js): now, the next 12 hours (scrolling sideways) and 7 days whose
// bars share one scale, the week from coldest to hottest.
Popover {
    id: root

    readonly property var now: Weather.current
    readonly property var nowLook: Rules.weatherLook(Panes.i18n, now.code, now.isDay)
    readonly property var today: Weather.daily[0] ?? { min: 0, max: 0 }
    readonly property real lo: Math.min(...Weather.daily.map(d => d.min))
    readonly property real hi: Math.max(...Weather.daily.map(d => d.max))

    function pct(v) {
        return (v - lo) / Math.max(1, hi - lo);
    }

    function dayName(dateStr, i) {
        if (i === 0)
            return I18n.t("common.today");
        if (i === 1)
            return I18n.t("common.tomorrow");
        const [y, m, d] = dateStr.split("-").map(Number);
        const name = I18n.qtLocale.toString(new Date(y, m - 1, d), "ddd").replace(".", "");
        return name.charAt(0).toUpperCase() + name.slice(1);   // text-transform: capitalize
    }

    name: "weather"
    bubbleWidth: 380
    padding: 12

    Column {
        width: parent.width

        // .fc-now: padding 2px 4px 10px, gap 12
        Item {
            width: parent.width
            height: 2 + 45.6 + 10

            Icon {
                x: 4
                y: 4.8
                name: root.nowLook.icon
                size: 40
                color: root.nowLook.color
            }
            Label {
                id: bigTemp
                x: 56
                y: 2
                text: `${root.now.temp}°`
                size: 38
                weight: Font.DemiBold
                letterSpacing: -1.14
                tnum: true
                color: Theme.menuText
            }
            Column {
                x: bigTemp.x + bigTemp.implicitWidth + 12
                anchors.verticalCenter: bigTemp.verticalCenter
                width: range.x - 12 - x
                Label {
                    width: parent.width
                    elide: Text.ElideRight
                    text: root.nowLook.label
                    size: 13.5
                    weight: Font.Bold
                    lineHeight: 16
                    color: Theme.menuText
                }
                Item { width: 1; height: 3 }
                Row {
                    spacing: 4
                    Icon { anchors.verticalCenter: parent.verticalCenter; name: "map-pin"; size: 13; color: Theme.menuSub }
                    Label { anchors.verticalCenter: parent.verticalCenter; text: Weather.city; size: 11; color: Theme.menuSub }
                }
            }
            Column {
                id: range
                x: parent.width - 4 - width
                anchors.verticalCenter: bigTemp.verticalCenter
                spacing: 3
                Label { anchors.right: parent.right; text: `↑ ${root.today.max}°`; size: 12; weight: Font.DemiBold; color: Theme.menuText }
                Label { anchors.right: parent.right; text: `↓ ${root.today.min}°`; size: 12; weight: Font.DemiBold; color: Theme.menuText }
            }
        }

        // .fc-chips: three equal chips, gap 6
        Row {
            spacing: 6
            Repeater {
                model: [
                    { icon: "thermometer", text: I18n.t("weather.feels", { temp: root.now.feels }) },
                    { icon: "droplets", text: `${root.now.humidity}%` },
                    { icon: "wind", text: `${root.now.wind} km/h` }
                ]
                Rectangle {
                    required property var modelData
                    width: (354 - 12) / 3
                    height: 27.8
                    radius: 9
                    color: Theme.menuSurface
                    Row {
                        anchors.centerIn: parent
                        spacing: 5
                        Icon { anchors.verticalCenter: parent.verticalCenter; name: modelData.icon; size: 13; color: Theme.menuSub }
                        Label { anchors.verticalCenter: parent.verticalCenter; text: modelData.text; size: 11.5; color: Theme.menuText }
                    }
                }
            }
        }

        Section { text: I18n.t("weather.nextHours") }
        // .fc-hours: 44px columns that scroll sideways, padding 0 2px
        Flickable {
            width: parent.width
            height: 86.2
            contentWidth: hours.width + 4
            flickableDirection: Flickable.HorizontalFlick
            boundsBehavior: Flickable.StopAtBounds
            clip: true

            Row {
                id: hours
                x: 2
                Repeater {
                    model: Weather.hourly.slice(0, 12)
                    Rectangle {
                        id: hour
                        required property var modelData
                        required property int index
                        readonly property var look: Rules.weatherLook(Panes.i18n, modelData.code, modelData.isDay)
                        width: 44
                        height: 86.2
                        radius: 9
                        color: index === 0 ? Theme.menuSurface : "transparent"
                        Column {
                            y: 6
                            anchors.horizontalCenter: parent.horizontalCenter
                            spacing: 5
                            Label {
                                anchors.horizontalCenter: parent.horizontalCenter
                                text: hour.index === 0 ? I18n.t("common.now") : I18n.formatHour(Number(hour.modelData.time.slice(0, 2)))
                                size: 11
                                color: Theme.menuSub
                            }
                            Icon { anchors.horizontalCenter: parent.horizontalCenter; name: hour.look.icon; size: 18; color: hour.look.color }
                            Label {
                                anchors.horizontalCenter: parent.horizontalCenter
                                text: `${hour.modelData.temp}°`
                                size: 12.5
                                weight: Font.Bold
                                tnum: true
                                color: Theme.menuText
                            }
                            Rain { anchors.horizontalCenter: parent.horizontalCenter; precip: hour.modelData.precip }
                        }
                    }
                }
            }
        }

        Section { text: I18n.t("weather.days") }
        // .fc-days: columns 58 22 40 30 1fr 30, gap 8, padding 6px
        Repeater {
            model: Weather.daily
            Rectangle {
                id: day
                required property var modelData
                required property int index
                readonly property var look: Rules.weatherLook(Panes.i18n, modelData.code, true)
                width: 354
                height: 30
                radius: 8
                color: dayHover.hovered ? Theme.menuSurface : "transparent"
                HoverHandler { id: dayHover }

                Label { x: 6; anchors.verticalCenter: parent.verticalCenter; width: 58; text: root.dayName(day.modelData.date, day.index); size: 12.5; color: Theme.menuText }
                Icon { x: 6 + 58 + 8 + 2; anchors.verticalCenter: parent.verticalCenter; name: day.look.icon; size: 18; color: day.look.color }
                Rain { x: 6 + 58 + 8 + 22 + 8; anchors.verticalCenter: parent.verticalCenter; precip: day.modelData.precip }
                Label {
                    x: 6 + 58 + 8 + 22 + 8 + 40 + 8
                    anchors.verticalCenter: parent.verticalCenter
                    width: 30
                    horizontalAlignment: Text.AlignRight
                    text: `${day.modelData.min}°`
                    size: 12.5
                    tnum: true
                    color: Theme.menuSub
                }
                Rectangle {
                    id: track
                    x: 6 + 58 + 8 + 22 + 8 + 40 + 8 + 30 + 8
                    width: 354 - 6 - 30 - 8 - x
                    height: 5
                    anchors.verticalCenter: parent.verticalCenter
                    radius: 2.5
                    color: Theme.menuStrong
                    Rectangle {
                        x: track.width * root.pct(day.modelData.min)
                        width: track.width * (root.pct(day.modelData.max) - root.pct(day.modelData.min))
                        height: parent.height
                        radius: 2.5
                        gradient: Gradient {
                            orientation: Gradient.Horizontal
                            GradientStop { position: 0; color: Rules.rangeColors[0] }
                            GradientStop { position: 0.5; color: Rules.rangeColors[1] }
                            GradientStop { position: 1; color: Rules.rangeColors[2] }
                        }
                    }
                }
                Label {
                    x: 354 - 6 - 30
                    anchors.verticalCenter: parent.verticalCenter
                    width: 30
                    text: `${day.modelData.max}°`
                    size: 12.5
                    weight: Font.DemiBold
                    tnum: true
                    color: Theme.menuText
                }
            }
        }

        // .fc-foot: padding 8px 6px 0, right-aligned
        Item {
            width: parent.width
            height: 8 + 13.2
            Label {
                x: parent.width - 6 - width
                y: 8
                text: I18n.t("weather.updated", { time: I18n.formatTime(Weather.updatedAt) })
                size: 11
                color: Theme.menuSub
            }
        }
    }

    // .rain: a droplet and the chance, only from 20% (keeps its 13px either way)
    component Rain: Row {
        property int precip
        height: 13
        spacing: 2
        Icon { visible: parent.precip >= 20; anchors.verticalCenter: parent.verticalCenter; name: "droplets"; size: 10; color: Rules.rainColor }
        Label { visible: parent.precip >= 20; anchors.verticalCenter: parent.verticalCenter; text: `${parent.precip}%`; size: 10.5; tnum: true; color: Rules.rainColor }
    }
}
