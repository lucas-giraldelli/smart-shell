import QtQuick
import Quickshell
import "../services"
import ".."
import "ui"
import "../lib/torrents.mjs" as TorrentRules

// The torrents popover (prototype: components/torrents): the services in
// config torrents.services and the VPN that are down (red, a click opens one),
// then one row per torrent, worst state first - its state icon, title
// ("Coraline (2009)", "Loki · S02", the release name on hover), size,
// progress, state (seeding: its days, yellow while still owed to the tracker,
// config torrents.seedDays) and the seeds in its swarm. Only what needs a look
// has a colour: red an error or a service down, yellow stalled or owed, blue
// downloading. The x at the end takes it out of qBittorrent, keeping its
// files (asking twice while owed); a stopped one also gets play; a click on
// the row opens the Web UI.
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
        seeding: { icon: "upload", color: Theme.menuSub }
    })
    function colorOf(status) {
        return looks[status]?.color ?? Theme.menuSub;
    }
    readonly property var rows: TorrentRules.sorted(Torrents.list)

    // the columns after the name: size, progress, state, seeds; then the
    // remove / start buttons
    readonly property var widths: [64, 40, 100, 44]
    readonly property int action: 54
    readonly property int minDays: Config.torrents?.seedDays ?? 7

    bubbleWidth: 640
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

        // the services that do not answer: a red dot and a name each
        Flow {
            visible: Torrents.down.length > 0
            x: 8
            width: parent.width - 16
            spacing: 14
            bottomPadding: 6
            Repeater {
                model: Torrents.services.concat([{ name: "VPN", url: "", up: Torrents.vpn }]).filter(s => !s.up)
                delegate: Row {
                    id: service
                    required property var modelData
                    spacing: 6
                    height: 18
                    Rectangle {
                        anchors.verticalCenter: parent.verticalCenter
                        width: 6
                        height: 6
                        radius: 3
                        color: Theme.crit
                    }
                    Label {
                        anchors.verticalCenter: parent.verticalCenter
                        text: service.modelData.name
                        size: 11
                        color: Theme.crit
                        MouseArea {
                            id: serviceArea
                            anchors.fill: parent
                            enabled: service.modelData.url !== ""
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: {
                                Qt.openUrlExternally(service.modelData.url);
                                Ui.closePopover();
                            }
                        }
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
            width: parent.width - 34 - 8 - root.action
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
                readonly property bool owed: TorrentRules.owed(modelData, root.minDays)
                property string armed: ""       // "remove": clicked once, waiting for the second
                // run `act`, or only arm it on a first click when `twice`
                function arm(what, twice, act) {
                    if (twice && armed !== what) {
                        armed = what;
                        disarm.restart();
                        return;
                    }
                    armed = "";
                    act();
                }

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
                    width: parent.width - 34 - 8 - root.action
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
                        color: row.status === "seeding" ? (row.owed ? Theme.warn : Theme.menuSub)
                            : row.status === "downloading" ? Theme.menuSub : root.colorOf(row.status)
                        text: I18n.t(`torrents.states.${row.status}`)
                            + (row.status === "seeding" ? ` · ${TorrentRules.seedDays(row.modelData)}d` : "")
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
                // on hover: x takes it out of qBittorrent, keeping its files
                // (twice while owed); a stopped one also gets play
                Row {
                    anchors.right: parent.right
                    anchors.rightMargin: 4
                    anchors.verticalCenter: parent.verticalCenter
                    spacing: 2
                    opacity: rowHover.hovered || row.armed !== "" ? 1 : 0

                    IconButton {
                        visible: TorrentRules.stopped(row.modelData)
                        implicitWidth: 24
                        implicitHeight: 24
                        radius: 6
                        flat: true
                        icon: "play"
                        iconSize: 13
                        onClicked: Torrents.start(row.modelData.hash)
                    }
                    IconButton {
                        visible: row.status === "seeding" || TorrentRules.stopped(row.modelData)
                        implicitWidth: 24
                        implicitHeight: 24
                        radius: 6
                        flat: true
                        off: row.armed === "remove"
                        icon: "x"
                        iconSize: 13
                        onClicked: row.arm("remove", row.owed, () => Torrents.remove(row.modelData.hash))
                    }
                }
                Timer {
                    id: disarm
                    interval: 3000
                    onTriggered: row.armed = ""
                }
            }
        }
    }
}
