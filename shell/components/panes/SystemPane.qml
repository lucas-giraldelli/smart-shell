import QtQuick
import QtQuick.Controls as QQC
import Quickshell
import "../.."
import "../../services"
import "../ui"
import ".."
import "../../lib/rules.mjs" as Rules

// System tab (prototype: control-center/panes/system.js): CPU load history
// with the die temperature, memory in use, uptime and a btop button, then the
// top memory users with a two-step kill: idle -> armed (3 s to confirm) ->
// term (SIGTERM sent) -> force (still alive after 3 s: SIGKILL on a click).
PaneScroll {
    id: root

    readonly property string cpuStatus: Rules.tempStatus(SystemStats, Config.thresholds)
    readonly property string memStatus: Rules.memStatus(SystemStats, Config.thresholds)

    property var kills: ({})    // process name -> { state, at }

    function setKill(name, state) {
        const k = Object.assign({}, kills);
        if (state)
            k[name] = { state, at: Date.now() };
        else
            delete k[name];
        kills = k;
    }

    function clickKill(group) {
        const state = kills[group.name]?.state ?? "idle";
        if (state === "idle") {
            setKill(group.name, "armed");
        } else if (state === "armed") {
            Processes.signal(group, "TERM");
            setKill(group.name, "term");
        } else if (state === "force") {
            Processes.signal(group, "KILL");
            setKill(group.name, null);
        }
    }

    Component.onCompleted: Processes.watchers++
    Component.onDestruction: Processes.watchers--

    // armed expires after 3 s; 3 s after SIGTERM a survivor can be forced
    Timer {
        interval: 250
        repeat: true
        running: Object.keys(root.kills).length > 0
        onTriggered: {
            for (const [name, { state, at }] of Object.entries(root.kills)) {
                if (Date.now() - at < 3000)
                    continue;
                if (state === "armed")
                    root.setKill(name, null);
                else if (state === "term")
                    root.setKill(name, Processes.top.some(p => p.name === name) ? "force" : null);
            }
        }
    }

    // the CSS `ch` of 11px Inter, for the memory column (min-width 7.3ch)
    FontMetrics {
        id: small
        font { family: Theme.font; pixelSize: 11; weight: Font.Medium }
    }

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

    // a row of two half-width toggles (.sys-actions): do not disturb (only
    // rules with `dnd: true` pop up) and the screen (the user's Super+F10,
    // blanking the panel so the OLED can run its care cycle)
    Row {
        x: 8
        width: parent.width - 16
        spacing: 6
        bottomPadding: 4
        SmallButton {
            width: (parent.width - 6) / 2
            icon: "bell-off"
            text: I18n.t("settings.dnd")
            active: Ui.dnd
            onClicked: Ui.dnd = !Ui.dnd
        }
        SmallButton {
            width: (parent.width - 6) / 2
            icon: "monitor-off"
            text: I18n.t("system.screenOff")
            onClicked: {
                const screen = Ui.popoverScreen;
                Ui.closePopover();
                Quickshell.execDetached(["hyprctl", "dispatch", "dpms", "toggle", screen]);
            }
        }
    }

    Section { text: I18n.t("system.top") }
    Repeater {
        model: Processes.top

        // .top-row: 25px, padding 0 8px, gap 10, 12.5px
        Rectangle {
            id: proc

            required property var modelData
            readonly property string kill: root.kills[modelData.name]?.state ?? "idle"
            readonly property bool guarded: Rules.isProtected(modelData.name)

            width: parent.width
            height: 25
            radius: 8
            color: rowHover.hovered ? Theme.menuSurface : "transparent"

            HoverHandler { id: rowHover }

            Row {
                x: 8
                anchors.verticalCenter: parent.verticalCenter
                spacing: 5
                Label {
                    anchors.verticalCenter: parent.verticalCenter
                    size: 12.5
                    color: Theme.menuText
                    text: proc.modelData.name
                }
                Label {
                    visible: proc.modelData.count > 1
                    anchors.verticalCenter: parent.verticalCenter
                    size: 11
                    tnum: true
                    color: Theme.menuSub
                    text: `×${proc.modelData.count}`
                }
            }
            Label {
                anchors.right: parent.right
                anchors.rightMargin: 8 + 20 + 10
                anchors.verticalCenter: parent.verticalCenter
                width: Math.max(implicitWidth, small.advanceWidth("0") * 7.3)
                horizontalAlignment: Text.AlignRight
                size: 11
                tnum: true
                color: Theme.menuSub
                text: Rules.fmtMem(Panes.i18n, proc.modelData.memMiB)
            }

            // the kill button: shown on hover or while a kill is under way
            Rectangle {
                id: killButton
                visible: !proc.guarded
                anchors.right: parent.right
                anchors.rightMargin: 8
                anchors.verticalCenter: parent.verticalCenter
                width: 20
                height: 20
                radius: 6
                readonly property bool alarm: proc.kill === "armed" || proc.kill === "force"
                opacity: rowHover.hovered || proc.kill !== "idle" ? 1 : 0
                color: alarm ? Theme.offTint : killArea.containsMouse && proc.kill === "idle" ? Theme.menuStrong : "transparent"

                Icon {
                    anchors.centerIn: parent
                    name: "trash-2"
                    size: 13
                    color: killButton.alarm ? Theme.crit : proc.kill === "term" ? Theme.menuFaint
                        : killArea.containsMouse ? Theme.menuText : Theme.menuSub
                }
                MouseArea {
                    id: killArea
                    anchors.fill: parent
                    hoverEnabled: true
                    enabled: proc.kill !== "term"
                    cursorShape: Qt.PointingHandCursor
                    onClicked: root.clickKill(proc.modelData)
                }

                QQC.ToolTip {
                    id: tip
                    visible: killArea.containsMouse || proc.kill !== "idle" && rowHover.hovered
                    delay: 300
                    text: I18n.t({ idle: "system.kill", armed: "system.killArm", term: "system.killWait", force: "system.killForce" }[proc.kill])
                    contentItem: Label { size: 11; color: Theme.menuText; text: tip.text }
                    background: Rectangle { radius: 6; color: Theme.menuBg; border.color: Theme.menuLine }
                }
            }
        }
    }
}
