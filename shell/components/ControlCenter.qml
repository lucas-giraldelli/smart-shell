import QtQuick
import ".."
import "ui"
import "panes"

// Tabbed popover hosting one pane per quick item (prototype:
// components/control-center). Lives inside the quick tile, which decides when
// it is open. Inactive tabs show only their icon, the active one also its
// name; every tab is 306px tall (the Docker tab height), so switching never
// resizes the popover. A tab whose backend is missing says what to install.
Popover {
    id: root

    readonly property var items: Panes.configured
    readonly property var active: items.find(i => i.pane.id === Ui.ccTab) ?? items[0]

    readonly property var panes: ({
        volume: volumePane,
        brightness: brightnessPane,
        docker: dockerPane,
        network: networkPane,
        system: systemPane,
        settings: settingsPane
    })

    name: "control-center"
    bubbleWidth: 430
    padding: 10

    Column {
        width: parent.width

        // .tabs: padding 4, gap 4, radius 11
        Rectangle {
            width: parent.width
            height: 4 + 28.4 + 4
            radius: 11
            color: Theme.menuSurface

            Row {
                x: 4
                y: 4
                spacing: 4

                Repeater {
                    model: root.items

                    delegate: Rectangle {
                        id: tab

                        required property var modelData
                        readonly property bool on: root.active?.pane.id === modelData.pane.id

                        width: on ? 408 - 8 - (root.items.length - 1) * (34 + 4) : 34
                        height: 28.4
                        radius: 8
                        color: on ? Theme.menuStrong : "transparent"
                        opacity: modelData.available ? 1 : 0.45
                        Behavior on color { ColorAnimation { duration: 150 } }

                        readonly property color fg: on || area.containsMouse ? Theme.menuText : Theme.menuSub

                        Row {
                            anchors.centerIn: parent
                            spacing: 6
                            Icon {
                                anchors.verticalCenter: parent.verticalCenter
                                name: tab.modelData.pane.icon
                                size: 14
                                color: tab.fg
                            }
                            Label {
                                visible: tab.on
                                anchors.verticalCenter: parent.verticalCenter
                                size: 12
                                color: tab.fg
                                text: Panes.label(tab.modelData.pane.id)
                            }
                        }

                        MouseArea {
                            id: area
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: Ui.ccTab = tab.modelData.pane.id
                        }
                    }
                }
            }
        }

        // the active pane; fades in (paneIn .18s ease-out)
        Item {
            width: parent.width
            height: 306
            clip: true

            Loader {
                id: pane
                width: parent.width
                height: parent.height
                // only build tabs while the popover shows
                active: root.open || root.visible
                sourceComponent: root.active?.available ? root.panes[root.active.pane.id] : missingPane

                onLoaded: appear.restart()
                transform: Translate { id: shift }

                ParallelAnimation {
                    id: appear
                    NumberAnimation { target: pane; property: "opacity"; from: 0; to: 1; duration: 180; easing.type: Easing.OutCubic }
                    NumberAnimation { target: shift; property: "y"; from: 4; to: 0; duration: 180; easing.type: Easing.OutCubic }
                }
            }
        }
    }

    Component { id: volumePane; VolumePane {} }
    Component { id: brightnessPane; BrightnessPane {} }
    Component { id: dockerPane; DockerPane {} }
    Component { id: networkPane; NetworkPane {} }
    Component { id: systemPane; SystemPane {} }
    Component { id: settingsPane; SettingsPane {} }
    Component { id: missingPane; MissingPane { pane: root.active.pane } }
}
