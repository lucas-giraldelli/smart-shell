import QtQuick
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
    Slider {
        icon: "sliders-horizontal"
        label: I18n.t("settings.magnify")
        from: 100
        to: 220
        value: Math.round(Ui.magnify * 100)
        valueText: `${Ui.magnify.toFixed(2)}×`
        onMoved: v => Ui.magnify = v / 100
    }
    // workspaces style: a segmented control, styled like the tab bar
    // (.ws-style: padding 6px 10px, gap 10)
    Item {
        width: parent.width
        height: 6 + seg.height + 6
        Label {
            x: 10
            anchors.verticalCenter: parent.verticalCenter
            size: 12.5
            color: Theme.menuText
            text: I18n.t("settings.wsStyle")
        }
        Rectangle {
            id: seg
            anchors.right: parent.right
            anchors.rightMargin: 10
            anchors.verticalCenter: parent.verticalCenter
            width: segRow.width + 4
            height: segRow.height + 4
            radius: 9
            color: Theme.menuSurface
            Row {
                id: segRow
                x: 2
                y: 2
                spacing: 2
                Repeater {
                    model: ["icons", "numbers", "dots"]
                    Rectangle {
                        id: option
                        required property string modelData
                        readonly property bool on: Ui.wsStyle === modelData
                        width: optLabel.implicitWidth + 20
                        height: optLabel.implicitHeight + 8
                        radius: 7
                        color: on ? Theme.menuStrong : "transparent"
                        Behavior on color { ColorAnimation { duration: 150 } }
                        Label {
                            id: optLabel
                            anchors.centerIn: parent
                            size: 11.5
                            color: option.on || optArea.containsMouse ? Theme.menuText : Theme.menuSub
                            text: I18n.t(`settings.wsStyles.${option.modelData}`)
                        }
                        MouseArea {
                            id: optArea
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: Ui.setWsStyle(option.modelData)
                        }
                    }
                }
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
    // .pet-select: a dropdown whose list opens in the flow; its 2px / 4px
    // margins collapse into the headings' around it
    Item {
        width: parent.width
        height: select.height
        Rectangle {
            id: select
            x: 8
            width: parent.width - 16
            height: 2 + 39 + list.height
            radius: 11
            color: Theme.menuSurface
            border.color: Theme.menuStrong
            clip: true

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

            Flickable {
                id: list
                x: 1
                y: 40
                width: parent.width - 2
                height: root.petOpen ? Math.min(214, opts.height + 1) : 0
                contentHeight: opts.height + 1
                clip: true
                boundsBehavior: Flickable.StopAtBounds
                Behavior on height { NumberAnimation { duration: 250; easing.type: Easing.Bezier; easing.bezierCurve: Theme.ease } }
                onHeightChanged: if (root.petOpen && height > 0) root.contentY = Math.max(root.contentY, Math.min(select.parent.y + select.y + select.height + 6 - root.height, root.contentHeight - root.height))

                Rectangle {
                    width: parent.width
                    height: 1
                    color: Theme.menuStrong
                }
                Column {
                    id: opts
                    y: 1
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
}
