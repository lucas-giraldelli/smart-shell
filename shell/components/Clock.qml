import QtQuick
import QtQuick.Effects
import Quickshell
import "../services"
import ".."
import "../lib/calendar.mjs" as Cal

// Time and date (prototype: components/clock). Shortly before an event
// (config.events.remindMinutes) the tile turns orange (warn); while an event
// runs it turns green (ok). Either way the date moves up next to the time and
// the event's name, with its category icon, takes the second line. Click opens
// the month calendar.
Tile {
    id: root

    // what's next matters more than what's running: warn first
    readonly property var event: Events.upcoming ?? Events.ongoing
    readonly property bool reminding: event !== null
    readonly property string status: Events.upcoming ? "warn" : Events.ongoing ? "ok" : ""
    readonly property color tint: Theme.status(status)
    readonly property string eventTitle: event ? Cal.titleOf(I18n, event) : ""

    // compact: as wide as its widest time and date (fixed per format and
    // language); a reminder widens it to 168px with the Bluetooth tile's spring
    implicitWidth: reminding ? 168 : compactWidth
    Behavior on implicitWidth { NumberAnimation { duration: 450; easing.type: Easing.Bezier; easing.bezierCurve: [0.3, 1.15, 0.5, 1, 1, 1] } }

    // padding (14px a side + border) around the widest time in the current
    // format ("00:00" / "12:00 PM", tabular digits) and the widest date line
    // of the language (every weekday x month), so it never changes from one
    // minute or day to the next
    FontMetrics {
        id: timeFont
        font { family: Theme.font; pixelSize: 20; weight: Font.DemiBold; features: Theme.tnum }
    }
    FontMetrics {
        id: dateFont
        font { family: Theme.font; pixelSize: 11; weight: Font.Medium }
    }
    readonly property real compactWidth: {
        const times = Config.clockFormat === "12h" ? ["12:00 AM", "12:00 PM"] : ["00:00"];
        const time = Math.max(...times.map(s => timeFont.advanceWidth(s) - 0.4 * s.length));
        let date = 0;
        for (let d = 0; d < 7; d++)
            for (let m = 0; m < 12; m++) {
                const first = new Date(2026, m, 1);
                const day = new Date(2026, m, 1 + ((d - first.getDay() + 7) % 7) + 21);   // a 2-digit day
                date = Math.max(date, dateFont.advanceWidth(I18n.capitalize(I18n.formatDate(day, "date"))));
            }
        return Math.ceil(Math.max(time, date)) + 14 * 2 + 2;
    }
    open: calendar.open
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
        shown: root.hovered && root.reminding
        text: root.event ? `${root.eventTitle} · ${I18n.formatTime(root.event.start)}–${I18n.formatTime(root.event.end)} · ${
            Events.upcoming ? I18n.t("reminder.soon", { minutes: Events.minutes }) : I18n.t("reminder.now")}` : ""
    }

    MouseArea {
        anchors.fill: parent
        cursorShape: Qt.PointingHandCursor
        onClicked: calendar.open ? Ui.closePopover() : Ui.openPopover("calendar")
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

        Label {
            id: time
            text: I18n.formatTime(clock.date)
            size: 20
            weight: Font.DemiBold
            letterSpacing: -0.4
            tnum: true
            shadow: true
            color: Theme.text
        }
        // the date joins the time while an event takes the second line
        Label {
            x: time.implicitWidth + 7 - (root.reminding ? 0 : 4)
            y: 9
            opacity: root.reminding ? 1 : 0
            text: I18n.capitalize(I18n.formatDate(clock.date, "mini"))
            size: 11
            shadow: true
            color: Theme.sub
            Behavior on x { NumberAnimation { duration: 300; easing.type: Easing.Bezier; easing.bezierCurve: Theme.ease } }
            Behavior on opacity { NumberAnimation { duration: 300; easing.type: Easing.Bezier; easing.bezierCurve: Theme.ease } }
        }

        // .sub-line: one 15px line that ticks up to the event
        Item {
            y: 26
            width: parent.width
            height: 15
            clip: true

            Column {
                y: root.reminding ? -15 : 0
                width: parent.width
                Behavior on y { NumberAnimation { duration: 400; easing.type: Easing.Bezier; easing.bezierCurve: [0.3, 0.9, 0.4, 1, 1, 1] } }

                Label {
                    width: parent.width
                    lineHeight: 15
                    elide: Text.ElideRight
                    text: I18n.capitalize(I18n.formatDate(clock.date, "date"))
                    size: 11
                    shadow: true
                    color: Theme.sub
                }
                Row {
                    width: parent.width
                    height: 15
                    spacing: 5
                    Icon {
                        anchors.verticalCenter: parent.verticalCenter
                        name: Cal.categories[root.event?.category]?.icon ?? "user"
                        size: 12
                        shadow: true
                        color: root.tint
                    }
                    Label {
                        width: parent.width - 17
                        lineHeight: 15
                        elide: Text.ElideRight
                        text: root.eventTitle
                        size: 11
                        weight: Font.DemiBold
                        shadow: true
                        color: Theme.text
                    }
                }
            }
        }
    }

    Calendar {
        id: calendar
        owner: root
    }
}
