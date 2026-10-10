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
        apps: appsWidget,
        tray: trayWidget,
        quick: quickWidget,
        weather: weatherWidget,
        prs: prsWidget,
        clock: clockWidget
    })

    readonly property var groups: Config.dock
        .map(g => Object.assign({}, g, { widgets: g.widgets.filter(id => widgets[id] && !Ui.hidden.includes(id)) }))
        .filter(g => g.widgets.length)

    // the app row's growing icons reach above the bar; the input mask adds them
    property Item appsHit: null

    implicitWidth: row.implicitWidth + Theme.padX * 2
    implicitHeight: Theme.size + Theme.padTop + Theme.padBottom
    radius: Theme.radius
    color: Theme.dockBg
    border.color: Theme.dockBorder
    // canarinho: a diagonal gradient (drawn left to right here)
    gradient: Theme.dockGradient ? dockGradient : null
    Gradient {
        id: dockGradient
        orientation: Gradient.Horizontal
        GradientStop { position: 0; color: Theme.dockGradient?.[0] ?? "transparent" }
        GradientStop { position: 1; color: Theme.dockGradient?.[1] ?? "transparent" }
    }

    // --shadow: the theme's outer shadow and a 1px inner highlight on top
    OuterShadow {
        z: -2
        anchors.fill: parent
        color: Theme.dockShadow
        offsetY: Theme.dockShadowY
        blur: Theme.dockShadowBlur
        radius: root.radius
    }
    Rectangle {
        x: root.radius * 0.6
        y: 1
        width: root.width - root.radius * 1.2
        height: 1
        color: Theme.dockInset
    }

    // the theme's tint and particles, inside the dock and behind its content
    DockEffects {
        anchors.fill: parent
        anchors.margins: 1
        radius: root.radius - 1
    }

    DockDecor {
        anchors.fill: parent
    }

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
        id: appsWidget
        AppRow {
            Component.onCompleted: root.appsHit = hit
        }
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
        id: prsWidget
        PrsTile {}
    }
    Component {
        id: clockWidget
        Clock {}
    }
}
