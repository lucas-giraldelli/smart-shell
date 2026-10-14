import QtQuick
import Quickshell
import "../services"
import ".."
import "ui"
import "../lib/torrents.mjs" as TorrentRules

// The torrents popover (prototype: components/torrents): one row per torrent,
// worst state first - its state icon, title ("Coraline (2009)", "Loki · S02",
// the release name on hover), size, progress, state and the seeds in its
// swarm. A click opens the qBittorrent Web UI.
Popover {
    id: root
    name: "torrents"

    // state -> icon / colour (prototype: LOOK in torrents.js)
    readonly property var looks: ({
        error: { icon: "circle-alert", color: Theme.crit },
        stalled: { icon: "triangle-alert", color: Theme.warn },
        downloading: { icon: "download", color: Theme.menuAccent },
        checking: { icon: "refresh-cw", color: Theme.menuSub },
        queued: { icon: "clock", color: Theme.menuSub },
        paused: { icon: "circle-pause", color: Theme.menuSub },
        seeding: { icon: "upload", color: Theme.ok }
    })
    function colorOf(status) {
        return looks[status]?.color ?? Theme.menuSub;
    }
    readonly property var rows: TorrentRules.sorted(Torrents.list)

    // the columns after the name: size, progress, state, seeds
    readonly property var widths: [64, 40, 76, 44]

    bubbleWidth: 560
    padding: 6

    component Cell: Label {
        horizontalAlignment: Text.AlignRight
        size: 11.5
        tnum: true
        color: Theme.menuSub
    }

    Column {
        width: parent.width

        // the section title, both speeds, refresh
        Item {
            width: parent.width
            height: 32
            Label {
                x: 8
                anchors.verticalCenter: parent.verticalCenter
                text: I18n.t("torrents.title").toUpperCase()
                size: 10.5
                weight: Font.DemiBold
                letterSpacing: 0.84
                color: Theme.menuFaint
            }
            Row {
                anchors.right: parent.right
                anchors.verticalCenter: parent.verticalCenter
                spacing: 8
                Label {
                    anchors.verticalCenter: parent.verticalCenter
                    size: 11
                    tnum: true
                    color: Theme.menuSub
                    text: `↓ ${TorrentRules.speed(Torrents.dlspeed)}  ↑ ${TorrentRules.speed(Torrents.upspeed)}`
                }
                IconButton {
                    icon: "refresh-cw"
                    onClicked: Torrents.refresh()
                    RotationAnimation on rotation {
                        running: Torrents.loading
                        from: 0
                        to: 360
                        duration: 800
                        loops: Animation.Infinite
                        onRunningChanged: if (!running) parent.rotation = 0
                    }
                }
            }
        }

        Item {
            visible: root.rows.length === 0
            width: parent.width
            height: 32
            Label {
                x: 8
                anchors.verticalCenter: parent.verticalCenter
                size: 11
                color: Theme.menuSub
                text: I18n.t("torrents.none")
            }
        }

        // column titles
        Row {
            visible: root.rows.length > 0
            x: 34
            width: parent.width - 34 - 8
            height: 22
            spacing: 8
            Label {
                anchors.verticalCenter: parent.verticalCenter
                width: parent.width - root.widths.reduce((a, b) => a + b, 0) - parent.spacing * root.widths.length
                text: I18n.t("torrents.name")
                size: 10.5
                color: Theme.menuFaint
            }
            Repeater {
                model: ["size", "progress", "status", "seeds"]
                Cell {
                    required property string modelData
                    required property int index
                    width: root.widths[index]
                    anchors.verticalCenter: parent.verticalCenter
                    text: I18n.t(`torrents.${modelData}`)
                    size: 10.5
                    tnum: false
                    color: Theme.menuFaint
                }
            }
        }

        // the rows: ten show, the rest scroll
        ListView {
            id: listView
            width: parent.width
            height: Math.min(root.rows.length, 10) * 32
            clip: true
            boundsBehavior: Flickable.StopAtBounds
            model: root.rows

            delegate: Rectangle {
                id: row

                required property var modelData
                readonly property string status: TorrentRules.statusOf(modelData)

                width: listView.width
                height: 32
                radius: 9
                color: rowHover.hovered ? Theme.menuHover : "transparent"

                HoverHandler { id: rowHover }

                Icon {
                    x: 8
                    anchors.verticalCenter: parent.verticalCenter
                    name: root.looks[row.status].icon
                    size: 16
                    color: root.looks[row.status].color
                }
                Row {
                    x: 34
                    width: parent.width - 34 - 8
                    anchors.verticalCenter: parent.verticalCenter
                    spacing: 8
                    Label {
                        anchors.verticalCenter: parent.verticalCenter
                        width: parent.width - root.widths.reduce((a, b) => a + b, 0) - parent.spacing * root.widths.length
                        elide: Text.ElideRight
                        size: 12.5
                        color: Theme.menuText
                        text: TorrentRules.title(row.modelData.name)
                    }
                    Cell { width: root.widths[0]; anchors.verticalCenter: parent.verticalCenter; text: TorrentRules.size(row.modelData.size) }
                    Cell { width: root.widths[1]; anchors.verticalCenter: parent.verticalCenter; text: TorrentRules.percent(row.modelData.progress) }
                    Cell {
                        width: root.widths[2]
                        anchors.verticalCenter: parent.verticalCenter
                        tnum: false
                        color: row.status === "seeding" || row.status === "downloading" ? Theme.menuSub : root.colorOf(row.status)
                        text: I18n.t(`torrents.states.${row.status}`)
                    }
                    Cell { width: root.widths[3]; anchors.verticalCenter: parent.verticalCenter; text: row.modelData.num_complete }
                }
                Tip {
                    target: row
                    text: `${row.modelData.name} · ${I18n.t("torrents.tip", { seeds: row.modelData.num_seeds, swarm: row.modelData.num_complete })}`
                    shown: rowHover.hovered
                }
                MouseArea {
                    anchors.fill: parent
                    cursorShape: Qt.PointingHandCursor
                    onClicked: {
                        Qt.openUrlExternally(Torrents.url);
                        Ui.closePopover();
                    }
                }
            }
        }
    }
}
