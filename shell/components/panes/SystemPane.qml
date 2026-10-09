import QtQuick
import Quickshell
import "../.."
import "../../services"
import "../ui"
import ".."
import "../../lib/rules.mjs" as Rules

// System tab (prototype: control-center/panes/system.js): CPU load history
// with the die temperature, memory in use, uptime and a btop button.
PaneScroll {
    id: root

    readonly property string cpuStatus: Rules.tempStatus(SystemStats)
    readonly property string memStatus: Rules.memStatus(SystemStats)

    // re-evaluated every minute for the uptime text
    SystemClock {
        id: clock
        precision: SystemClock.Minutes
    }

    // .sys-pane: two cards, gap 8, padding 4px 8px 8px
    Item {
        width: parent.width
        height: 4 + 90.4 + 8

        Row {
            x: 8
            y: 4
            spacing: 8

            // CPU
            Rectangle {
                width: (404 - 16 - 8) / 2
                height: 90.4
                radius: 11
                color: Theme.menuSurface
                readonly property color tint: Theme.status(root.cpuStatus)
                readonly property bool alarm: root.cpuStatus !== "ok"

                Item {
                    id: cpuHead
                    x: 12
                    y: 10
                    width: parent.width - 24
                    height: 19.2
                    Icon { anchors.verticalCenter: parent.verticalCenter; name: "cpu"; size: 14; color: Theme.menuSub }
                    Label { x: 21; anchors.verticalCenter: parent.verticalCenter; size: 12; color: Theme.menuText; text: I18n.t("system.cpu") }
                    Label {
                        anchors.right: parent.right
                        anchors.verticalCenter: parent.verticalCenter
                        size: 16
                        weight: Font.Bold
                        tnum: true
                        color: parent.parent.alarm ? parent.parent.tint : Theme.menuText
                        text: `${Math.round(SystemStats.load)}%`
                    }
                }
                Sparkline {
                    x: 12
                    y: 10 + 19.2 + 7 + 4
                    width: parent.width - 24
                    height: 20
                    max: 100
                    values: SystemStats.history
                    color: parent.tint
                }
                Label {
                    x: 12
                    y: 10 + 19.2 + 7 + 24 + 7
                    size: 11
                    tnum: true
                    color: parent.alarm ? parent.tint : Theme.menuSub
                    text: I18n.t("system.temp", { temp: SystemStats.temp })
                }
            }

            // memory
            Rectangle {
                width: (404 - 16 - 8) / 2
                height: 90.4
                radius: 11
                color: Theme.menuSurface
                readonly property color tint: Theme.status(root.memStatus)
                readonly property bool alarm: root.memStatus !== "ok"

                Item {
                    x: 12
                    y: 10
                    width: parent.width - 24
                    height: 19.2
                    Icon { anchors.verticalCenter: parent.verticalCenter; name: "memory-stick"; size: 14; color: Theme.menuSub }
                    Label { x: 21; anchors.verticalCenter: parent.verticalCenter; size: 12; color: Theme.menuText; text: I18n.t("system.memory") }
                    Label {
                        anchors.right: parent.right
                        anchors.verticalCenter: parent.verticalCenter
                        size: 16
                        weight: Font.Bold
                        tnum: true
                        color: parent.parent.alarm ? parent.parent.tint : Theme.menuText
                        text: I18n.t("system.free", { free: I18n.formatNumber(SystemStats.memFree) })
                    }
                }
                // .mem-bar: 6px, margin 7px 0
                Rectangle {
                    x: 12
                    y: 10 + 19.2 + 7 + 7
                    width: parent.width - 24
                    height: 6
                    radius: 3
                    color: Theme.menuStrong
                    Rectangle {
                        width: SystemStats.memTotal ? parent.width * (SystemStats.memTotal - SystemStats.memFree) / SystemStats.memTotal : 0
                        height: parent.height
                        radius: 3
                        color: parent.parent.tint
                        Behavior on width { NumberAnimation { duration: 800; easing.type: Easing.Bezier; easing.bezierCurve: Theme.ease } }
                    }
                }
                Label {
                    x: 12
                    y: 10 + 19.2 + 7 + 7 + 6 + 7 + 7
                    size: 11
                    tnum: true
                    color: parent.alarm ? parent.tint : Theme.menuSub
                    text: I18n.t("system.used", { used: I18n.formatNumber(SystemStats.memTotal - SystemStats.memFree), total: SystemStats.memTotal })
                }
            }
        }
    }

    // uptime + btop (.dk-head)
    Item {
        width: parent.width
        height: 4 + btop.height + 8

        Row {
            x: 8
            anchors.verticalCenter: btop.verticalCenter
            spacing: 6
            Icon { anchors.verticalCenter: parent.verticalCenter; name: "power"; size: 13; color: Theme.menuSub }
            Label {
                size: 12
                tnum: true
                color: Theme.menuSub
                text: clock.date, I18n.t("system.uptime", { time: Rules.uptime(Panes.i18n, SystemStats.bootedAt.getTime()) })
            }
        }
        SmallButton {
            id: btop
            anchors.right: parent.right
            anchors.rightMargin: 8
            y: 4
            icon: "external-link"
            text: "btop"
            onClicked: {
                Quickshell.execDetached(["sh", "-c", Config.commands.monitor]);
                Ui.closePopover();
            }
        }
    }
}
