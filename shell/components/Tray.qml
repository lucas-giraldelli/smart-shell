import QtQuick
import Quickshell
import Quickshell.Services.SystemTray
import ".."

// System tray (prototype: components/tray): StatusNotifierItem icons in a
// two-column grid inside a tile. Click activates an item, middle click runs its
// secondary action, scroll goes to the item, right click opens its menu in a
// popover (TrayMenu). An empty tray hides the tile.
// Items matching config.tray.hidden (id, title or icon) are left out - Bluetooth
// has its own widget, and quitting fcitx5 from here breaks text input. Icons
// are drawn grey and dimmed so app colours don't fight the glass, except for
// vivid pixels: status badges like Slack's unread dot keep their colour (Slack
// never sets NeedsAttention, the dot in its pixmap is the only signal). Hover
// brings the whole icon back in colour.
Tile {
    id: root

    readonly property var items: SystemTray.items.values.filter(item => {
        const keys = [item.id, item.title, item.icon].join(" ").toLowerCase();
        return !Config.trayHidden.some(word => keys.includes(word.toLowerCase()));
    })
    readonly property int rows: Math.ceil(items.length / 2)
    // grid rows stretch to fill the tile (CSS grid, align-content: normal)
    readonly property real rowHeight: Math.max(18, (Theme.size - 2 - 4 * (rows - 1)) / rows)

    property var menuItem: null    // the item whose menu is showing

    readonly property bool shown: items.length > 0
    // two 1fr columns keep their 18px even when the second one is empty
    implicitWidth: 18 * 2 + 4 + 9 * 2 + 2
    open: menu.open

    Grid {
        id: grid
        x: 10
        y: 1
        columns: 2
        columnSpacing: 4
        rowSpacing: 4

        Repeater {
            model: root.items

            delegate: Item {
                id: cell

                required property var modelData

                width: 18
                height: root.rowHeight

                Image {
                    id: icon
                    anchors.centerIn: parent
                    width: 18
                    height: 18
                    sourceSize: Qt.size(36, 36)
                    source: cell.modelData.icon
                    smooth: true
                    visible: false
                }
                // greyed and dimmed, badges kept in colour; full colour on hover
                ShaderEffect {
                    anchors.fill: icon
                    property var source: icon
                    property real dim: area.containsMouse ? 1 : Theme.sub.a
                    property real color: area.containsMouse ? 1 : 0
                    fragmentShader: Qt.resolvedUrl("../shaders/tray-icon.frag.qsb")
                    scale: area.containsMouse ? 1.2 : 1
                    Behavior on scale { NumberAnimation { duration: 200; easing.type: Easing.Bezier; easing.bezierCurve: Theme.ease } }
                    Behavior on color { NumberAnimation { duration: 200 } }
                    Behavior on dim { NumberAnimation { duration: 200 } }
                }

                MouseArea {
                    id: area
                    anchors.centerIn: parent
                    width: 18
                    height: 18
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    acceptedButtons: Qt.LeftButton | Qt.RightButton | Qt.MiddleButton
                    onClicked: mouse => {
                        const item = cell.modelData;
                        const wantsMenu = mouse.button === Qt.RightButton || (mouse.button === Qt.LeftButton && item.onlyMenu);
                        if (wantsMenu && item.hasMenu) {
                            if (menu.open && root.menuItem === item) {
                                Ui.closePopover();
                            } else {
                                root.menuItem = item;
                                Ui.openPopover("tray");
                            }
                            return;
                        }
                        Ui.closePopover();
                        if (mouse.button === Qt.MiddleButton)
                            item.secondaryActivate();
                        else if (mouse.button === Qt.LeftButton)
                            item.activate();
                    }
                    onWheel: wheel => cell.modelData.scroll(wheel.angleDelta.y || wheel.angleDelta.x, wheel.angleDelta.y === 0)
                }
            }
        }
    }

    // opened from outside (IPC): show the first item that has a menu
    Connections {
        target: Ui
        function onPopoverChanged() {
            if (Ui.popover === "tray" && !root.menuItem)
                root.menuItem = root.items.find(i => i.hasMenu) ?? null;
        }
    }

    TrayMenu {
        id: menu
        owner: root
        handle: root.menuItem?.menu ?? null
    }
}
