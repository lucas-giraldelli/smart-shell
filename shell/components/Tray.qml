import QtQuick
import Quickshell
import Quickshell.Services.SystemTray
import ".."
import "../services"
import "../lib/prs.mjs" as PrRules
import "../lib/torrents.mjs" as TorrentRules

// System tray (prototype: components/tray): StatusNotifierItem icons in a
// two-column grid inside a tile. Click focuses the app window when it has one
// open (Apps.windowOf), else activates the item; middle click runs its
// secondary action, scroll goes to the item, right click opens its menu in a
// popover (TrayMenu). An empty tray hides the tile.
// Items matching config.tray.hidden (id, title or icon) are left out - Bluetooth
// has its own widget, and quitting fcitx5 from here breaks text input. Icons
// are drawn grey and dimmed so app colours do not fight the glass, except for
// vivid pixels: status badges like Slack unread dot keep their colour (Slack
// never sets NeedsAttention, the dot in its pixmap is the only signal). Hover
// brings the whole icon back in colour. An item needing attention - SNI
// NeedsAttention, or for one listed in config.tray.redBadge a red badge in its
// pixmap or "N notifications" in its tooltip (Slack never sets the status) - hops like the caps lock arrow, right
// away and then every 8 s until it is dealt with - every 2 s while Slack
// badge is red.
Tile {
    id: root

    readonly property var items: SystemTray.items.values.filter(item => {
        const keys = [item.id, item.title, item.icon].join(" ").toLowerCase();
        return !Config.trayHidden.some(word => keys.includes(word.toLowerCase()));
    })
    // the pull requests ride in the tray as one more item (the `prs` widget)
    readonly property bool withPrs: Prs.loaded && Config.dock.some(g => g.widgets.includes("prs")) && !Ui.hidden.includes("prs")
    // the icon colour and count are the user's own PRs: a followed one only lists
    readonly property var shownPrs: Prs.list.filter(p => !Ui.prsHidden.includes(p.repo) && !p.followed)
    readonly property int prCount: shownPrs.filter(p => !p.merged).length
    readonly property string prWorst: PrRules.worst(shownPrs) ?? ""
    // and so do the torrents (the `torrents` widget): the download icon while
    // any downloads, else the upload one, in the worst state colour
    readonly property bool withTorrents: Torrents.loaded && Config.dock.some(g => g.widgets.includes("torrents")) && !Ui.hidden.includes("torrents")
    readonly property string torrentWorst: TorrentRules.worst(Torrents.list) ?? ""
    readonly property bool downloading: Torrents.list.some(t => ["downloading", "stalled", "queued", "checking"].includes(TorrentRules.statusOf(t)) && t.progress < 1)
    readonly property int cells: items.length + (withPrs ? 1 : 0) + (withTorrents ? 1 : 0)
    // 16px icons 6px apart, with 6px of room above and below: as many rows as the dock
    // height fits (two at 52px, one at 42px), the rest goes into columns -
    // at least two, so a second item does not widen the tile
    readonly property real padY: 6
    readonly property real gap: 6
    readonly property int maxRows: Math.max(1, Math.floor((Theme.size - 2 - 2 * padY + gap) / (16 + gap)))
    readonly property int columns: cells <= 1 ? 1 : Math.max(2, Math.ceil(cells / maxRows))
    readonly property int rows: Math.ceil(cells / columns)
    // grid rows stretch to fill the tile (CSS grid, align-content: normal)
    readonly property real rowHeight: Math.max(16, (Theme.size - 2 - 2 * root.padY - root.gap * (rows - 1)) / rows)

    property var menuItem: null    // the item whose menu is showing

    readonly property bool shown: cells > 0
    // the columns keep their 16px even when the last one is empty
    implicitWidth: 16 * Math.max(2, columns) + gap * (Math.max(2, columns) - 1) + 9 * 2 + 2
    open: menu.open || prList.open || torrentList.open

    // a lone item sits in the middle of the tile
    Grid {
        id: grid
        x: root.cells === 1 ? (root.width - 16) / 2 : 10
        y: 1 + root.padY
        columns: root.columns
        columnSpacing: root.gap
        rowSpacing: root.gap

        Repeater {
            model: root.items

            delegate: Item {
                id: cell

                required property var modelData
                readonly property string keys: [modelData.id, modelData.title, modelData.icon].join(" ").toLowerCase()
                readonly property bool watchBadge: Config.trayRedBadge.some(w => keys.includes(w.toLowerCase()))
                readonly property bool redBadge: watchBadge && TrayBadges.red[modelData.id] === true
                // Slack also says it in its tooltip: "You have 1 notification" (mentions,
                // DMs) as opposed to "You have unread messages" (the blue dot)
                readonly property bool notified: watchBadge && /\b[1-9]\d* notifications?\b/i.test(modelData.tooltipTitle ?? "")
                readonly property bool attention: modelData.status === Status.NeedsAttention || redBadge || notified

                onAttentionChanged: if (attention) hop.restart()
                transform: Translate { id: lift }

                width: 16
                height: root.rowHeight

                Image {
                    id: icon
                    anchors.centerIn: parent
                    width: 16
                    height: 16
                    sourceSize: Qt.size(32, 32)
                    source: cell.modelData.icon
                    smooth: true
                    visible: false
                }
                // the hop: -2.5px, +0.5px, rest (the caps lock arrow)
                SequentialAnimation {
                    id: hop
                    NumberAnimation { target: lift; property: "y"; to: -2.5; duration: 240; easing.type: Easing.Bezier; easing.bezierCurve: [0.3, 0.7, 0.4, 1, 1, 1] }
                    NumberAnimation { target: lift; property: "y"; to: 0.5; duration: 208; easing.type: Easing.Bezier; easing.bezierCurve: [0.3, 0.7, 0.4, 1, 1, 1] }
                    NumberAnimation { target: lift; property: "y"; to: 0; duration: 192; easing.type: Easing.Bezier; easing.bezierCurve: [0.3, 0.7, 0.4, 1, 1, 1] }
                }
                Timer {
                    running: cell.attention
                    repeat: true
                    interval: cell.redBadge || cell.notified ? 2000 : 8000
                    onTriggered: hop.restart()
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

                // the app tooltip, or its title
                Tip {
                    target: cell
                    text: cell.modelData.tooltipTitle || cell.modelData.title || cell.modelData.id
                    shown: area.containsMouse && !menu.open
                }

                MouseArea {
                    id: area
                    anchors.centerIn: parent
                    width: 16
                    height: 16
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
                            (Apps.windowOf(cell.keys) ?? item).activate();
                    }
                    onWheel: wheel => cell.modelData.scroll(wheel.angleDelta.y || wheel.angleDelta.x, wheel.angleDelta.y === 0)
                }
            }
        }

        Item {
            id: prCell
            visible: root.withPrs
            width: 16
            height: root.rowHeight

            Icon {
                anchors.centerIn: parent
                name: "git-pull-request"
                size: 16
                color: prList.colorOf(root.prWorst)
                scale: prArea.containsMouse ? 1.2 : 1
                Behavior on scale { NumberAnimation { duration: 200; easing.type: Easing.Bezier; easing.bezierCurve: Theme.ease } }
            }
            Tip {
                target: prCell
                text: I18n.t("prs.tile", { n: root.prCount })
                shown: prArea.containsMouse && !prList.open
            }
            MouseArea {
                id: prArea
                anchors.centerIn: parent
                width: 16
                height: 16
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: prList.open ? Ui.closePopover() : Ui.openPopover("prs")
            }
        }

        Item {
            id: torrentCell
            visible: root.withTorrents
            width: 16
            height: root.rowHeight

            Icon {
                anchors.centerIn: parent
                name: root.downloading ? "download" : "upload"
                size: 16
                // green when all is well: seeding, paused or queued
                color: Torrents.down.length ? Theme.crit
                    : ["error", "stalled", "downloading"].includes(root.torrentWorst) ? torrentList.colorOf(root.torrentWorst) : Theme.ok
                scale: torrentArea.containsMouse ? 1.2 : 1
                Behavior on scale { NumberAnimation { duration: 200; easing.type: Easing.Bezier; easing.bezierCurve: Theme.ease } }
            }
            Tip {
                target: torrentCell
                text: I18n.t("torrents.tile", { n: Torrents.list.length })
                    + (Torrents.down.length ? ` · ${I18n.t("torrents.down", { names: Torrents.down.join(", ") })}` : "")
                shown: torrentArea.containsMouse && !torrentList.open
            }
            MouseArea {
                id: torrentArea
                anchors.centerIn: parent
                width: 16
                height: 16
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: torrentList.open ? Ui.closePopover() : Ui.openPopover("torrents")
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

    PrList {
        id: prList
        owner: root
    }

    TorrentList {
        id: torrentList
        owner: root
    }

    TrayMenu {
        id: menu
        owner: root
        handle: root.menuItem?.menu ?? null
    }
}
