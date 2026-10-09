import QtQuick
import QtQuick.Controls
import Quickshell
import "../.."
import "../../services"
import "../ui"
import ".."
import "../../lib/rules.mjs" as Rules

// Docker tab (prototype: control-center/panes/docker.js): a summary with the
// service status and a lazydocker button that stays put, then the containers
// with start / stop; only the list scrolls.
Item {
    id: root

    readonly property var count: Rules.counts(Docker.containers)
    readonly property string status: Rules.dockerStatus(Docker)
    readonly property string mem: Rules.fmtMem(Panes.i18n, Rules.totalMem(Docker))

    // .dk-head: padding 4px 8px 8px, 12px menu-sub
    Item {
        id: head
        x: 2
        y: 8
        width: parent.width - 4
        height: 4 + lazy.height + 8

        Row {
            x: 8
            anchors.verticalCenter: lazy.verticalCenter
            spacing: 8
            Led {
                anchors.verticalCenter: parent.verticalCenter
                status: root.status
            }
            Label {
                size: 12
                color: root.status === "crit" ? Theme.crit : Theme.menuSub
                text: Docker.running
                    ? I18n.t("docker.summary", { up: root.count.up, total: root.count.total, mem: root.mem })
                    : I18n.t("docker.serviceDown")
            }
        }
        SmallButton {
            id: lazy
            anchors.right: parent.right
            anchors.rightMargin: 8
            y: 4
            icon: "external-link"
            text: "lazydocker"
            onClicked: {
                Quickshell.execDetached(["sh", "-c", Config.commands.docker]);
                Ui.closePopover();
            }
        }
    }

    // a Repeater, not a ListView: ListView incubates delegates across frames,
    // and switching tabs mid-way destroys them half-built
    Flickable {
        id: list
        x: 2
        y: head.y + head.height
        width: parent.width - 4
        height: parent.height - y - 2
        contentHeight: rows.height
        clip: true
        boundsBehavior: Flickable.StopAtBounds

        ScrollBar.vertical: ScrollBar {
            policy: list.contentHeight > list.height ? ScrollBar.AsNeeded : ScrollBar.AlwaysOff
            width: 6
            contentItem: Rectangle { radius: 3; color: Theme.menuStrong; opacity: parent.active ? 1 : 0 }
        }

        Column {
            id: rows
            width: list.width
            Repeater {
                model: Docker.containers

                // .ct: padding 6px 8px, gap 10, 12.5px
                delegate: Rectangle {
                    id: ct

                    required property var modelData
                    readonly property bool running: modelData.state === "running"
                    readonly property string status: Docker.running ? Rules.containerStatus(modelData, Docker.containers) : "off"

                    width: list.width
                    height: 6 + 28.2 + 6
                    radius: 9
                    color: hover.hovered ? Theme.menuSurface : "transparent"

                    HoverHandler { id: hover }

                    Led {
                        x: 8
                        anchors.verticalCenter: parent.verticalCenter
                        status: ct.status
                    }
                    Column {
                        x: 26
                        anchors.verticalCenter: parent.verticalCenter
                        width: tail.x - 10 - x
                        Label {
                            width: parent.width
                            text: ct.modelData.name
                            size: 12.5
                            elide: Text.ElideRight
                            color: ct.status === "off" ? Theme.menuSub : Theme.menuText
                        }
                        Label {
                            width: parent.width
                            text: Docker.running ? Rules.describe(Panes.i18n, ct.modelData, Docker.containers) : "—"
                            size: 11
                            elide: Text.ElideRight
                            color: ct.status === "crit" ? Theme.crit : Theme.menuSub
                        }
                    }
                    Row {
                        id: tail
                        anchors.right: parent.right
                        anchors.rightMargin: 8
                        anchors.verticalCenter: parent.verticalCenter
                        spacing: 10

                        Label {
                            visible: Docker.running && ct.running
                            anchors.verticalCenter: parent.verticalCenter
                            text: Rules.fmtMem(Panes.i18n, ct.modelData.memMiB)
                            size: 11
                            tnum: true
                            color: Theme.menuSub
                        }
                        // .tag: 10px, padding 2px 7px, pill
                        Rectangle {
                            visible: ct.running && ct.modelData.health === "healthy"
                            anchors.verticalCenter: parent.verticalCenter
                            width: tag.implicitWidth + 14
                            height: tag.implicitHeight + 4
                            radius: height / 2
                            color: Theme.healthyBg
                            Label {
                                id: tag
                                anchors.centerIn: parent
                                text: "healthy"
                                size: 10
                                color: Theme.ok
                            }
                        }
                        IconButton {
                            width: 26
                            height: 26
                            radius: 8
                            iconSize: 13
                            icon: ct.running ? "square" : "play"
                            onClicked: Docker.toggle(ct.modelData.name)
                        }
                    }
                }
            }
        }
    }
}
