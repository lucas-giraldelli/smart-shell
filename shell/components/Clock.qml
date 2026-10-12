import QtQuick
import QtQuick.Effects
import Quickshell
import "../services"
import ".."
import "../lib/calendar.mjs" as Cal

// Time and date (prototype: components/clock). Shortly before an event
// (config.events.remindMinutes) the tile turns orange (warn); while an event
// runs it turns green (ok). Either way the date moves up next to the time and
// the event name, with its category icon, takes the second line. A running
// timer (services/Countdown.qml) takes it the same way, in its own colour,
// when no event does; one that ended rings (the tile shakes) until a click
// stops it. Click opens the month calendar, right click the timer.
Tile {
    id: root

    // what is next matters more than what is running: warn first
    readonly property var event: Events.upcoming ?? Events.ongoing
    // a ringing timer wins over an event
    readonly property bool timing: Countdown.running && (event === null || Countdown.ringing)
    readonly property bool reminding: event !== null || timing
    readonly property string status: Events.upcoming ? "warn" : Events.ongoing ? "ok" : ""
    readonly property color tint: timing ? Countdown.color : Theme.status(status)
    readonly property string timerText: Countdown.remainingText + (Countdown.label ? ` · ${Countdown.label}` : "")
    readonly property string eventTitle: event ? Cal.titleOf(I18n, event) : ""

    // compact: as wide as its widest time and date (fixed per format and
    // language); a reminder widens it to 168px with the Bluetooth tile spring
    // a timer: as wide as its lines, the same 14px on both sides
    implicitWidth: timing ? Math.ceil(Math.max(time.implicitWidth + 7 + miniDate.implicitWidth, 17 + timerLine.implicitWidth)) + 14 * 2 + 2
        : reminding ? 168 : compactWidth
    Behavior on implicitWidth { NumberAnimation { duration: 450; easing.type: Easing.Bezier; easing.bezierCurve: [0.3, 1.15, 0.5, 1, 1, 1] } }

    // the same 14px padding (+ border) on both sides of the wider of the widest
    // time in the current format ("00:00" / "12:00 PM", tabular digits, so
    // minutes never move it) and the date line of today. The date decides, and it
    // only changes at midnight; sizing for the widest date of the year ("Dom,
    // 08 de mar") would leave up to 8px of extra room on the right.
    FontMetrics {
        id: dateFont
        font { family: Theme.font; pixelSize: 11; weight: Font.Medium }
    }
    FontMetrics {
        id: timeInk
        font { family: Theme.font; pixelSize: 20; weight: Font.DemiBold }
    }
    FontMetrics {
        id: timeFont
        font { family: Theme.font; pixelSize: 20; weight: Font.DemiBold; features: Theme.tnum }
    }
    readonly property real compactWidth: {
        const times = Config.clockFormat === "12h" ? ["12:00 AM", "12:00 PM"] : ["00:00"];
        const time = Math.max(...times.map(s => timeFont.advanceWidth(s) - 0.4 * s.length));
        // measured to the date ink, not its advance: the visible gap on the
        // right then matches the one on the left (checked on screen)
        const ink = dateFont.tightBoundingRect(dateLine.text);
        const date = ink.x + ink.width;
        return Math.ceil(Math.max(time, date)) + 14 * 2 + 2;
    }
    open: calendar.open || timerMenu.open
    color: reminding ? Theme.blend(tint, Theme.tileBg, 0.2) : Theme.tileBg
    border.color: reminding ? Theme.mix(tint, 0.6) : Theme.tileBorder
    Behavior on color { ColorAnimation { duration: 500 } }

    // box-shadow: 0 0 14px status 25%
    RectangularShadow {
        z: -1
        visible: root.reminding
        anchors.fill: parent
        blur: 14
        radius: root.radius
        color: Theme.mix(root.tint, 0.25)
    }

    Tip {
        target: root
        shown: root.hovered && root.reminding && !Countdown.ringing
        text: root.timing ? `${Countdown.label || I18n.t("timer.title")} · ${Countdown.paused ? I18n.t("timer.paused") : I18n.t("timer.ends", { time: I18n.formatTime(new Date(Countdown.end)) })}`
            : root.event ? `${root.eventTitle} · ${I18n.formatTime(root.event.start)}–${I18n.formatTime(root.event.end)} · ${
            Events.upcoming ? I18n.t("reminder.soon", { minutes: Events.minutes }) : I18n.t("reminder.now")}${
            root.event.meet ? ` · ${I18n.t("reminder.join")}` : ""}` : ""
    }

    // click opens the calendar, right click the timer; the reminder video
    // icon joins the Meet
    MouseArea {
        anchors.fill: parent
        acceptedButtons: Qt.LeftButton | Qt.RightButton
        cursorShape: Qt.PointingHandCursor
        onClicked: mouse => {
            if (Countdown.ringing)
                return Countdown.cancel();
            const menu = mouse.button === Qt.RightButton ? timerMenu : calendar;
            menu.open ? Ui.closePopover() : Ui.openPopover(menu.name);
        }
    }

    SystemClock {
        id: clock
        precision: SystemClock.Minutes
    }

    // padding 0 14px, column gap 2: the time line (24) and the sub line (15)
    Item {
        x: 15
        y: (root.height - 41) / 2
        width: root.width - 30
        height: 41

        // compact: time centered over the date by their ink, with proportional
        // digits (a tabular "1" leaves room on its left, so the lines looked
        // off); the reminder keeps them left-aligned and tabular
        Label {
            id: time
            readonly property rect ink: timeInk.tightBoundingRect(text)
            x: root.reminding ? 0 : (parent.width - (ink.width - 0.4 * (text.length - 1))) / 2 - ink.x
            Behavior on x { NumberAnimation { duration: 450; easing.type: Easing.Bezier; easing.bezierCurve: [0.3, 1.15, 0.5, 1, 1, 1] } }
            text: I18n.formatTime(clock.date)
            size: 20
            weight: Font.DemiBold
            letterSpacing: -0.4
            tnum: root.reminding
            shadow: true
            color: Theme.text
        }
        // the date joins the time while an event takes the second line
        Label {
            id: miniDate
            x: time.x + time.implicitWidth + 7 - (root.reminding ? 0 : 4)
            y: 5    // its digits centred on the time digits
            opacity: root.reminding ? 1 : 0
            text: I18n.capitalize(I18n.formatDate(clock.date, "mini"))
            size: 11
            shadow: true
            color: Theme.sub
            Behavior on x { NumberAnimation { duration: 300; easing.type: Easing.Bezier; easing.bezierCurve: Theme.ease } }
            Behavior on opacity { NumberAnimation { duration: 300; easing.type: Easing.Bezier; easing.bezierCurve: Theme.ease } }
        }

        // .sub-line: one 15px line that ticks up to the event. The clip is
        // only for that tick: 4px of room on each side, or a glyph edge on
        // the line start (the "D" of Domingo) gets cut
        Item {
            x: -4
            y: 26
            width: parent.width + 8
            height: 15
            clip: true

            Column {
                x: 4
                y: root.reminding ? -15 : 0
                width: parent.width - 8
                Behavior on y { NumberAnimation { duration: 400; easing.type: Easing.Bezier; easing.bezierCurve: [0.3, 0.9, 0.4, 1, 1, 1] } }

                Label {
                    id: dateLine
                    // compact: centered by its ink
                    readonly property rect ink: dateFont.tightBoundingRect(text)
                    x: root.reminding ? 0 : (parent.width - ink.width) / 2 - ink.x
                    width: root.reminding ? parent.width : implicitWidth
                    Behavior on x { NumberAnimation { duration: 450; easing.type: Easing.Bezier; easing.bezierCurve: [0.3, 1.15, 0.5, 1, 1, 1] } }
                    lineHeight: 15
                    elide: Text.ElideRight
                    text: I18n.capitalize(I18n.formatDate(clock.date, "date"))
                    size: 11
                    shadow: true
                    color: Theme.sub
                }
                // a timer line is centred under the time and date
                Row {
                    x: root.timing ? (parent.width - width) / 2 : 0
                    width: root.timing ? implicitWidth : parent.width
                    height: 15
                    spacing: 5
                    Icon {
                        anchors.verticalCenter: parent.verticalCenter
                        name: root.timing ? (Countdown.ringing ? "bell-ring" : Countdown.paused ? "pause" : "timer") : Cal.categories[root.event?.category]?.icon ?? "user"
                        size: 12
                        shadow: true
                        color: root.tint
                    }
                    Label {
                        id: timerLine
                        width: root.timing ? implicitWidth : parent.width - 17 - (root.event?.meet ? 17 : 0)
                        lineHeight: 15
                        elide: Text.ElideRight
                        text: root.timing ? root.timerText : root.eventTitle
                        size: 11
                        weight: Font.DemiBold
                        tnum: root.timing
                        shadow: true
                        color: Theme.text
                    }
                    // a Meet link: this icon joins the call
                    Icon {
                        visible: !!root.event?.meet
                        anchors.verticalCenter: parent.verticalCenter
                        name: "video"
                        size: 12
                        shadow: true
                        color: root.tint
                        scale: meetArea.containsMouse ? 1.25 : 1
                        Behavior on scale { NumberAnimation { duration: 150 } }
                        MouseArea {
                            id: meetArea
                            anchors.fill: parent
                            anchors.margins: -5
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: {
                                Ui.closePopover();
                                Quickshell.execDetached(["xdg-open", root.event.meet]);
                            }
                        }
                    }
                }
            }
        }
    }

    Calendar {
        id: calendar
        owner: root
    }
    TimerMenu {
        id: timerMenu
        owner: root
    }

    // ringing: a shake every 1.2 s, about the bottom centre
    transformOrigin: Item.Bottom
    SequentialAnimation on rotation {
        running: Countdown.ringing
        loops: Animation.Infinite
        onRunningChanged: if (!running) root.rotation = 0
        NumberAnimation { to: -4; duration: 60 }
        NumberAnimation { to: 4; duration: 90 }
        NumberAnimation { to: -3; duration: 90 }
        NumberAnimation { to: 3; duration: 90 }
        NumberAnimation { to: 0; duration: 70 }
        PauseAnimation { duration: 800 }
    }
}
