import QtQuick
import "../.."
import "../../services"
import "../ui"
import ".."
import "../../lib/rules.mjs" as Rules

// Brightness tab (prototype: control-center/panes/brightness.js): monitor
// brightness over DDC/CI with presets, and the night light (hyprsunset),
// shown disabled when hyprsunset is missing.
PaneScroll {
    Section { first: true; text: I18n.t("brightness.monitor") }
    Slider {
        icon: "sun"
        label: `${Brightness.name || "—"} · DDC/CI`
        stepSize: Brightness.unit
        value: Brightness.brightness
        valueText: Brightness.brightness + "%"
        onMoved: v => Brightness.set(v)
    }

    // .presets: 4 columns, gap 6, padding 4px 8px
    Item {
        width: parent.width
        height: 4 + 29.8 + 4
        Row {
            x: 8
            y: 4
            spacing: 6
            Repeater {
                model: Rules.brightnessPresets
                Rectangle {
                    id: preset
                    required property var modelData
                    readonly property bool on: Brightness.brightness === modelData[1]
                    width: (404 - 16 - 18) / 4
                    height: 29.8
                    radius: 8
                    color: on ? Theme.mix(Theme.menuAccent, 0.15) : area.containsMouse ? Theme.menuStrong : Theme.menuSurface
                    border.color: on ? Theme.mix(Theme.menuAccent, 0.6) : Theme.menuStrong
                    Label {
                        anchors.centerIn: parent
                        text: I18n.t(`brightness.presets.${preset.modelData[0]}`)
                        size: 11.5
                        color: Theme.menuText
                    }
                    MouseArea {
                        id: area
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: Brightness.set(preset.modelData[1])
                    }
                }
            }
        }
    }

    Section { text: I18n.t("brightness.night") }
    // .disabled-block without hyprsunset: faded, inert, the meta in warn
    Column {
        width: parent.width
        enabled: Caps.hyprsunset
        opacity: Caps.hyprsunset ? 1 : 0.45

        MenuRow {
            icon: "moon"
            title: I18n.t("brightness.night")
            meta: Caps.hyprsunset ? "hyprsunset" : Rules.missingText(Panes.i18n, "hyprsunset")
            metaColor: Caps.hyprsunset ? Theme.menuSub : Theme.warn
            onClicked: Brightness.setNight(!Brightness.night)
            Switch { on: Caps.hyprsunset && Brightness.night }
        }
        Slider {
            icon: "moon"
            warm: true
            label: I18n.t("brightness.temperature")
            from: 2500
            to: 6500
            stepSize: 100
            value: Brightness.nightK
            valueText: Brightness.nightK + "K"
            onMoved: v => Brightness.setNightK(v)
        }
    }
}
