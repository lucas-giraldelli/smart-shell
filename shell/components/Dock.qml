import QtQuick
import ".."

// The dock bar (prototype: components/dock). Its content is built from
// config.dock: groups of widgets with a separator between the non-empty ones;
// a group marked `tiles` packs its widgets 8px apart. Widgets switched off in
// the dock settings (Ui.hidden) are skipped, and so are the ones not ported
// to the shell yet.
Rectangle {
    id: root

    // widget id -> component (prototype: components/registry.js)
    readonly property var widgets: ({
        workspaces: workspacesWidget,
        capslock: capsWidget,
        bluetooth: bluetoothWidget,
        music: musicWidget,
        tray: trayWidget,
        quick: quickWidget,
        weather: weatherWidget,
        clock: clockWidget
    })

    readonly property var groups: Config.dock
        .map(g => Object.assign({}, g, { widgets: g.widgets.filter(id => widgets[id] && !Ui.hidden.includes(id)) }))
        .filter(g => g.widgets.length)

    implicitWidth: row.implicitWidth + Theme.padX * 2
    implicitHeight: Theme.size + Theme.padTop + Theme.padBottom
    radius: Theme.radius
    color: Theme.dockBg
    border.color: Theme.dockBorder

    // a click on the bar itself closes any open popover
    MouseArea {
        anchors.fill: parent
        onClicked: Ui.closePopover()
    }

    Row {
        id: row
        x: Theme.padX
        y: Theme.padTop
        height: Theme.size
        spacing: Theme.gap

        Repeater {
            model: root.groups

            delegate: Row {
                id: group

                required property var modelData
                required property int index

                height: Theme.size
                spacing: Theme.gap

                Rectangle {
                    visible: group.index > 0
                    anchors.verticalCenter: parent.verticalCenter
                    width: 1
                    height: Theme.size * 0.7
                    color: Theme.sep
                }

                Row {
                    height: Theme.size
                    spacing: group.modelData.tiles ? Theme.tilesGap : Theme.gap

                    Repeater {
                        model: group.modelData.widgets

                        delegate: Loader {
                            required property string modelData
                            sourceComponent: root.widgets[modelData]
                            // a widget can step aside on its own (an empty tray)
                            visible: item ? (item.shown ?? true) : false
                        }
                    }
                }
            }
        }
    }

    Component {
        id: workspacesWidget
        Item {
            implicitWidth: ws.implicitWidth + 8   // padding: 0 4px
            implicitHeight: Theme.size
            Workspaces {
                id: ws
                x: 4
                anchors.verticalCenter: parent.verticalCenter
            }
        }
    }
    Component {
        id: capsWidget
        CapsLock {}
    }
    Component {
        id: bluetoothWidget
        BluetoothTile {}
    }
    Component {
        id: musicWidget
        Music {}
    }
    Component {
        id: trayWidget
        Tray {}
    }
    Component {
        id: quickWidget
        Quick {}
    }
    Component {
        id: weatherWidget
        Weather {}
    }
    Component {
        id: clockWidget
        Clock {}
    }
}
