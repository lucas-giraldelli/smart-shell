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
    property bool petOpen: false

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
    // .pet-select: the pet picker, and beside it, half and half, the care
    // switch (.pet-row)
    Item {
        id: petRow
        width: parent.width
        height: select.height
        z: 10

        Rectangle {
            x: select.x + select.width + 8
            width: select.width
            height: 41
            radius: 11
            color: tamaArea.containsMouse ? Theme.menuHover : Theme.menuSurface
            border.color: Theme.menuStrong
            Row {
                x: 10
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
        Rectangle {
            id: select
            x: 8
            width: (parent.width - 16 - 8) / 2
            height: 41
            radius: 11
            color: Theme.menuSurface
            border.color: Theme.menuStrong

            PetOption {
                x: 1
                y: 1
                width: parent.width - 2
                pet: Ui.pet
                label: root.petName(Ui.pet)
                chevron: true
                open: root.petOpen
                onClicked: root.petOpen = !root.petOpen
            }
        }

        // the list: a window of its own, floating out of the popover (it
        // neither pushes nor scrolls the pane), below the picker or, without
        // room, above; as wide as the row
        PopupWindow {
            id: petList
            visible: root.petOpen
            anchor.item: select
            anchor.rect.x: 0
            anchor.rect.y: select.height + 4
            anchor.edges: Edges.Top | Edges.Left
            anchor.gravity: Edges.Bottom | Edges.Right
            anchor.adjustment: PopupAdjustment.FlipY
            implicitWidth: petRow.width - 16
            implicitHeight: Math.min(214, opts.height + 2)
            color: "transparent"
            onVisibleChanged: Ui.popoverExtras = visible ? [petList] : []

            Rectangle {
                anchors.fill: parent
                radius: 11
                color: Qt.rgba(Theme.menuBg.r, Theme.menuBg.g, Theme.menuBg.b, 0.97)
                border.color: Theme.menuStrong
                clip: true

                Flickable {
                    id: petFlick
                    x: 1
                    y: 1
                    width: parent.width - 2
                    height: parent.height - 2
                    contentHeight: opts.height
                    clip: true
                    boundsBehavior: Flickable.StopAtBounds
                    // the wheel, handled here: the popup window doesn't pass it on
                    WheelHandler {
                        onWheel: event => {
                            const dy = event.angleDelta.y !== 0 ? -event.angleDelta.y / 120 * 39 : -event.pixelDelta.y;
                            petFlick.contentY = Math.max(0, Math.min(petFlick.contentHeight - petFlick.height, petFlick.contentY + dy));
                        }
                    }
                    Column {
                        id: opts
                        width: parent.width
                        Repeater {
                            model: [...Pets.names, "none"]
                            PetOption {
                                required property string modelData
                                width: opts.width
                                pet: modelData === "none" ? "" : modelData
                                label: root.petName(pet)
                                selected: (Ui.pet || "") === pet
                                onClicked: {
                                    root.petOpen = false;
                                    Ui.pet = pet;
                                }
                            }
                        }
                    }
                }
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
