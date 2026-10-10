import QtQuick
import Quickshell
import "../.."
import "../ui"
import ".."
import "../../lib/themes.mjs" as Themes

// Dock tab (prototype: control-center/panes/settings.js): look, which widgets
// and pet show, language. Saved to the shell's state file (Ui). The quick tile
// can't be switched off here, since that would hide this very tab.
PaneScroll {
    id: root

    readonly property var toggleable: ["workspaces", "capslock", "apps", "music", "weather", "bluetooth", "tray", "clock"]

    property string petHover: ""   // the pet under the mouse in the grid

    function petName(k) {
        return I18n.t(k && Pets.species[k] ? `pets.names.${k}` : "settings.noPet");
    }

    Section { text: I18n.t("settings.look") }
    // .themes: 4 columns, gap 6, padding 2px 8px 6px
    Item {
        width: parent.width
        height: 2 + themes.height + 6
        Grid {
            id: themes
            x: 8
            y: 2
            columns: 4
            spacing: 6
            Repeater {
                model: Themes.themes
                Rectangle {
                    id: theme
                    required property var modelData
                    readonly property bool on: Ui.theme === modelData.id
                    width: (404 - 16 - 18) / 4
                    height: 8 + 22 + 5 + 13.2 + 8 + 2
                    radius: 10
                    color: on ? Theme.mix(Theme.menuAccent, 0.12) : area.containsMouse ? Theme.menuHover : Theme.menuSurface
                    border.color: on ? Theme.menuAccent : "transparent"
                    Column {
                        anchors.centerIn: parent
                        spacing: 5
                        Rectangle {
                            anchors.horizontalCenter: parent.horizontalCenter
                            width: 22
                            height: 22
                            radius: 7
                            color: theme.modelData.swatch
                            border.color: Theme.menuStrong
                        }
                        Label {
                            anchors.horizontalCenter: parent.horizontalCenter
                            size: 11
                            color: theme.on || area.containsMouse ? Theme.menuText : Theme.menuSub
                            text: I18n.t(`themes.${theme.modelData.id}`)
                        }
                    }
                    MouseArea {
                        id: area
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: Ui.setTheme(theme.modelData.id)
                    }
                }
            }
        }
    }
    Slider {
        icon: "sliders-horizontal"
        label: I18n.t("settings.size")
        from: 40
        to: 72
        value: Ui.size
        valueText: `${Ui.size}px`
        onMoved: v => Ui.size = v
    }
    // workspaces style
    SegmentedRow {
        label: I18n.t("settings.wsStyle")
        options: ["icons", "numbers", "dots"].map(value => ({ value, text: I18n.t(`settings.wsStyles.${value}`) }))
        current: Ui.wsStyle
        onPicked: value => Ui.setWsStyle(value)
    }
    // the current weather drawn inside the dock
    Item {
        width: parent.width
        height: 29
        Rectangle {
            x: 8
            width: (404 - 16 - 10) / 2
            height: 29
            radius: 8
            color: wxArea.containsMouse ? Theme.menuHover : "transparent"
            Row {
                x: 4
                anchors.verticalCenter: parent.verticalCenter
                spacing: 9
                Check {
                    anchors.verticalCenter: parent.verticalCenter
                    on: Ui.weatherFx
                }
                Label {
                    anchors.verticalCenter: parent.verticalCenter
                    size: 12.5
                    color: Theme.menuText
                    text: I18n.t("settings.weatherFx")
                }
            }
            MouseArea {
                id: wxArea
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: Ui.weatherFx = !Ui.weatherFx
            }
        }
    }

    Section { text: I18n.t("settings.widgets") }
    // .checks: 2 columns, gap 2px 10px, padding 0 8px
    Item {
        width: parent.width
        height: checks.height
        Grid {
            id: checks
            x: 8
            columns: 2
            rowSpacing: 2
            columnSpacing: 10
            Repeater {
                model: root.toggleable
                Rectangle {
                    id: check
                    required property string modelData
                    width: (404 - 16 - 10) / 2
                    height: 29
                    radius: 8
                    color: checkArea.containsMouse ? Theme.menuHover : "transparent"
                    Row {
                        x: 4
                        anchors.verticalCenter: parent.verticalCenter
                        spacing: 9
                        Check {
                            anchors.verticalCenter: parent.verticalCenter
                            on: !Ui.hidden.includes(check.modelData)
                        }
                        Label {
                            anchors.verticalCenter: parent.verticalCenter
                            size: 12.5
                            color: Theme.menuText
                            text: I18n.t(`widgets.${check.modelData}`)
                        }
                    }
                    MouseArea {
                        id: checkArea
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: Ui.toggleHidden(check.modelData)
                    }
                }
            }
        }
    }

    Section { text: I18n.t("settings.pets") }
    // .pet-grid: every pet at rest, six to a row; a click picks it ("none"
    // sits on the care row below)
    Item {
        width: parent.width
        height: petGrid.height
        Grid {
            id: petGrid
            x: 8
            columns: 6
            spacing: 4
            Repeater {
                model: Pets.names
                Rectangle {
                    id: petCell
                    required property string modelData
                    readonly property bool on: (Ui.pet || "") === modelData
                    width: (404 - 16 - 4 * 5) / 6
                    height: 42
                    radius: 9
                    color: on ? Theme.mix(Theme.menuAccent, 0.14) : cellArea.containsMouse ? Theme.menuHover : Theme.menuSurface
                    border.color: on ? Theme.menuAccent : "transparent"
                    Image {
                        visible: petCell.modelData !== ""
                        anchors.centerIn: parent
                        width: 42
                        height: 42 * 36 / 46
                        sourceSize: Qt.size(84, 66)
                        source: Pets.sprite(petCell.modelData, true)
                    }
                    Label {
                        visible: petCell.modelData === ""
                        anchors.centerIn: parent
                        size: 11
                        color: Theme.menuSub
                        text: I18n.t("settings.noPet")
                    }
                    MouseArea {
                        id: cellArea
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: Ui.pet = petCell.modelData
                        onContainsMouseChanged: root.petHover = containsMouse ? petCell.modelData : ""
                    }
                }
            }
        }
    }
    // care mode (services/Tama.qml); on the right, the pet's name (the one
    // under the mouse, else the chosen one). 10px below the grid
    Item {
        width: parent.width
        height: 10
    }
    Item {
        width: parent.width
        height: 29
        Row {
            anchors.right: parent.right
            anchors.rightMargin: 8
            anchors.verticalCenter: parent.verticalCenter
            spacing: 8
            Label {
                anchors.verticalCenter: parent.verticalCenter
                size: 12
                color: Theme.menuSub
                text: root.petName(root.petHover || Ui.pet)
            }
            SmallButton {
                anchors.verticalCenter: parent.verticalCenter
                text: I18n.t("settings.noPet")
                active: !Ui.pet
                onClicked: Ui.pet = ""
            }
        }
        Rectangle {
            x: 8
            width: (404 - 16 - 10) / 2
            height: 29
            radius: 8
            color: tamaArea.containsMouse ? Theme.menuHover : "transparent"
            Row {
                x: 4
                anchors.verticalCenter: parent.verticalCenter
                spacing: 9
                Check {
                    anchors.verticalCenter: parent.verticalCenter
                    on: Ui.tamaOn
                }
                Label {
                    anchors.verticalCenter: parent.verticalCenter
                    size: 12.5
                    color: Theme.menuText
                    text: I18n.t("settings.tama")
                }
            }
            MouseArea {
                id: tamaArea
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: Ui.tamaOn = !Ui.tamaOn
            }
        }
    }

    Section { text: I18n.t("settings.language") }
    // .langs: gap 6, padding 2px 8px 4px
    Item {
        width: parent.width
        height: 2 + 30.4 + 4
        Row {
            x: 8
            y: 2
            spacing: 6
            Repeater {
                model: Object.keys(I18n.locales)
                Rectangle {
                    id: lang
                    required property string modelData
                    readonly property bool on: I18n.current === modelData
                    width: (404 - 16 - 6) / 2
                    height: 30.4
                    radius: 9
                    color: on ? Theme.mix(Theme.menuAccent, 0.12) : Theme.menuSurface
                    border.color: on ? Theme.menuAccent : "transparent"
                    Label {
                        anchors.centerIn: parent
                        size: 12
                        color: Theme.menuText
                        text: I18n.t(`settings.locales.${lang.modelData}`)
                    }
                    MouseArea {
                        anchors.fill: parent
                        cursorShape: Qt.PointingHandCursor
                        onClicked: Ui.locale = lang.modelData
                    }
                }
            }
        }
    }
    // the clock: 24h / 12h, whatever the language
    SegmentedRow {
        label: I18n.t("settings.clock")
        options: [{ value: "24h", text: "24h" }, { value: "12h", text: "12h" }]
        current: Config.clockFormat
        onPicked: value => Ui.setClockFormat(value)
    }
}
