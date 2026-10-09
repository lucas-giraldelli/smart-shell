import QtQuick
import Quickshell
import QtQuick.Controls as QQC
import "../services"
import ".."
import "ui"
import "../lib/calendar.mjs" as Cal

// Month calendar of the clock tile (prototype: components/clock/calendar.js):
// navigate months (buttons or the wheel over the grid), weekends tinted,
// holidays dotted per region (config.holidays) and days with one-off events
// (not routine recurring meetings) marked with a dash in their calendar's
// colour. Selecting a day lists its all-day events as chips, its holidays and
// the timed ones - today's finished ones folded away. Opens on today.
Popover {
    id: root

    property date view: new Date()
    property date selected: new Date()
    property bool showPast: false
    property date now: new Date()

    readonly property var enabled: (Config.holidays ?? []).filter(r => Cal.regions[r])
    readonly property var days: Cal.monthDays(I18n, view, selected, now, enabled, Events.list)
    readonly property var dayHolidays: Cal.holidaysOf(I18n, selected.getFullYear(), enabled).get(Cal.dateKey(selected)) ?? []
    readonly property var dayEvents: Cal.eventsOn(Events.list, selected)
    readonly property bool hasDetails: dayHolidays.length + dayEvents.length > 0
    readonly property var timed: dayEvents.filter(e => !e.allDay).sort((a, b) => a.start - b.start)
    // on today, meetings that already ended fold into one line
    readonly property var past: Cal.sameDay(selected, now) ? timed.filter(e => e.end <= now) : []
    readonly property var rest: timed.filter(e => !past.includes(e))
    readonly property var allDay: dayEvents.filter(e => e.allDay)

    function colorOf(e) {
        return Qt.color(Events.calendars[e.calendars?.[0]] ?? Theme.accent);
    }
    function shift(n) {
        view = new Date(view.getFullYear(), view.getMonth() + n, 1);
    }
    function goToday() {
        now = new Date();
        view = new Date(now.getFullYear(), now.getMonth(), 1);
        selected = now;
        showPast = false;
    }
    function holidayMeta(h) {
        return Cal.regionName(I18n, h.region) + (h.kind === "optional" ? ` · ${I18n.t("calendar.optional")}` : "");
    }

    // every time it opens, start from today
    onOpenChanged: if (open) goToday()

    name: "calendar"
    bubbleWidth: 316
    padding: 10

    Column {
        width: parent.width

        // .cal-head: padding 0 2px 8px, gap 6
        Item {
            width: parent.width
            height: 28 + 8
            IconButton {
                x: 2
                width: 28
                height: 28
                icon: "chevron-left"
                onClicked: root.shift(-1)
            }
            Label {
                x: 2 + 28 + 6 + 4
                y: (28 - height) / 2
                text: I18n.capitalize(I18n.formatDate(root.view, "month"))
                size: 14
                weight: Font.Bold
                color: Theme.menuText
            }
            SmallButton {
                anchors.right: next.left
                anchors.rightMargin: 6
                y: (28 - height) / 2
                text: I18n.t("calendar.today")
                onClicked: root.goToday()
            }
            IconButton {
                id: next
                x: parent.width - 2 - 28
                width: 28
                height: 28
                icon: "chevron-right"
                onClicked: root.shift(1)
            }
        }

        // .week: 7 columns, gap 2
        Row {
            spacing: 2
            Repeater {
                model: I18n.t("calendar.weekdays")
                Label {
                    required property string modelData
                    required property int index
                    width: (294 - 12) / 7
                    height: 4 + 12.6 + 4
                    horizontalAlignment: Text.AlignHCenter
                    text: modelData
                    size: 10.5
                    weight: Font.DemiBold
                    color: index === 0 || index === 6 ? Theme.menuWeekend : Theme.menuFaint
                }
            }
        }

        // .grid: 6 weeks of 36px days, gap 2; the wheel changes month
        Grid {
            id: grid
            columns: 7
            spacing: 2

            WheelHandler {
                onWheel: event => root.shift(event.angleDelta.y < 0 ? 1 : -1)
            }

            Repeater {
                model: root.days
                Rectangle {
                    id: cell
                    required property var modelData
                    readonly property var d: modelData
                    width: (294 - 12) / 7
                    height: 36
                    radius: 9
                    opacity: d.other ? 0.35 : 1
                    color: d.today && d.selected ? Theme.mix(Theme.accent, 0.22)
                        : d.selected ? Theme.menuStrong
                        : cellArea.containsMouse ? Theme.menuHover
                        : d.weekend ? Theme.mix(Theme.menuWeekend, 0.06) : "transparent"
                    // today: inset 1.5px ring in the accent
                    border.width: d.today ? 1.5 : 0
                    border.color: Theme.accent

                    Label {
                        anchors.centerIn: parent
                        text: cell.d.date.getDate()
                        size: 12.5
                        tnum: true
                        weight: cell.d.today || cell.d.holiday ? Font.Bold : Font.Medium
                        color: cell.d.holiday ? Theme.menuHoliday : cell.d.weekend ? Theme.menuWeekend : Theme.menuText
                    }
                    // dots hang below the number: holidays, then one dash for events
                    Row {
                        anchors.horizontalCenter: parent.horizontalCenter
                        anchors.bottom: parent.bottom
                        anchors.bottomMargin: 5
                        spacing: 2
                        Repeater {
                            model: cell.d.holidays
                            Rectangle {
                                required property var modelData
                                anchors.bottom: parent.bottom
                                width: 4
                                height: 4
                                radius: 2
                                color: modelData.kind === "optional" ? "transparent" : Cal.regions[modelData.region].color
                                border.width: modelData.kind === "optional" ? 1 : 0
                                border.color: Cal.regions[modelData.region].color
                            }
                        }
                        Rectangle {
                            visible: cell.d.special.length > 0
                            anchors.bottom: parent.bottom
                            width: 9
                            height: 3
                            radius: 1.5
                            color: cell.d.special.length ? root.colorOf(cell.d.special[0]) : "transparent"
                        }
                    }
                    MouseArea {
                        id: cellArea
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: {
                            const d = cell.d.date;
                            root.selected = d;
                            root.showPast = false;
                            if (d.getMonth() !== root.view.getMonth())
                                root.view = new Date(d.getFullYear(), d.getMonth(), 1);
                        }
                    }
                }
            }
        }

        // the selected day: .cal-day, margin-top 12, padding 0 8px, gap 6
        Column {
            visible: root.hasDetails
            x: 8
            width: parent.width - 16
            topPadding: 12
            spacing: 6

            Item {
                width: parent.width
                height: 14.4
                Label {
                    text: I18n.capitalize(I18n.formatDate(root.selected, "long"))
                    size: 12
                    weight: Font.DemiBold
                    color: Theme.menuText
                }
                // "N anteriores": dotted underline
                Label {
                    id: toggle
                    visible: root.past.length > 0
                    anchors.right: parent.right
                    y: 1
                    text: I18n.t(root.showPast ? "calendar.hidePast" : "calendar.showPast", { n: root.past.length })
                    size: 11
                    color: toggleArea.containsMouse ? Theme.menuText : Theme.menuSub
                    Row {
                        y: parent.height + 1.5
                        spacing: 2
                        Repeater {
                            model: Math.ceil(toggle.implicitWidth / 3)
                            Rectangle { width: 1; height: 1; color: toggle.color }
                        }
                    }
                    MouseArea {
                        id: toggleArea
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: root.showPast = !root.showPast
                    }
                }
            }

            // all-day events as one line of chips; the rest folds into "+N"
            Row {
                visible: root.allDay.length > 0
                width: parent.width
                spacing: 5
                Repeater {
                    model: [...root.allDay.slice(0, 2).map(e => ({ text: Cal.titleOf(I18n, e), color: root.colorOf(e) })),
                        ...(root.allDay.length > 2 ? [{ text: `+${root.allDay.length - 2}`, color: Theme.menuSub, more: true }] : [])]
                    Rectangle {
                        required property var modelData
                        width: Math.min(chip.implicitWidth + 16 + 2, (parent.width - 40) / Math.min(2, root.allDay.length))
                        height: chip.implicitHeight + 4 + 2
                        radius: height / 2
                        color: Theme.mix(modelData.color, 0.22)
                        border.color: Theme.mix(modelData.color, 0.45)
                        Label {
                            id: chip
                            x: 9
                            width: parent.width - 18
                            anchors.verticalCenter: parent.verticalCenter
                            elide: Text.ElideRight
                            text: modelData.text
                            size: 11
                            color: Theme.menuText
                        }
                    }
                }
            }

            Repeater {
                model: root.dayHolidays
                HolidayRow { width: parent.width; holiday: modelData; inset: 0 }
            }

            // the day's timed events scroll after ~5 rows
            ListView {
                visible: count > 0
                width: parent.width
                height: Math.min(contentHeight, 112)
                interactive: contentHeight > 112
                clip: true
                boundsBehavior: Flickable.StopAtBounds
                model: [...(root.showPast ? root.past.map(e => ({ e, past: true })) : []), ...root.rest.map(e => ({ e, past: false }))]
                QQC.ScrollBar.vertical: QQC.ScrollBar {
                    width: 6
                    contentItem: Rectangle { radius: 3; color: Theme.menuStrong; opacity: parent.active ? 1 : 0 }
                }
                delegate: Item {
                    required property var modelData
                    width: ListView.view.width
                    height: 3 + 14.4 + 3
                    opacity: modelData.past ? 0.45 : 1
                    Row {
                        anchors.verticalCenter: parent.verticalCenter
                        spacing: 8
                        Rectangle { anchors.verticalCenter: parent.verticalCenter; width: 3; height: 14; radius: 1.5; color: root.colorOf(modelData.e) }
                        Label {
                            anchors.verticalCenter: parent.verticalCenter
                            width: Math.max(52, implicitWidth)
                            text: I18n.formatTime(modelData.e.start)
                            size: 12
                            tnum: true
                            color: Theme.menuSub
                        }
                    }
                    // a Google Meet link: a small button that opens it
                    IconButton {
                        id: meetButton
                        visible: !!modelData.e.meet
                        anchors.right: parent.right
                        anchors.verticalCenter: parent.verticalCenter
                        width: 22; height: 22; radius: 7; iconSize: 13
                        flat: true
                        icon: "video"
                        onClicked: Quickshell.execDetached(["xdg-open", modelData.e.meet])
                    }
                    Label {
                        x: 3 + 8 + 52 + 8
                        anchors.verticalCenter: parent.verticalCenter
                        width: parent.width - x - (meetButton.visible ? 26 : 0)
                        elide: Text.ElideRight
                        text: Cal.titleOf(I18n, modelData.e)
                        size: 12
                        color: Theme.menuText
                    }
                }
            }
        }

        // nothing on the selected day: the next holidays instead
        Section {
            visible: !root.hasDetails
            text: I18n.t("calendar.upcoming")
        }
        Repeater {
            model: root.hasDetails ? [] : Cal.upcoming(I18n, root.now, root.enabled, 3)
            HolidayRow {
                width: parent.width
                holiday: modelData
                when: I18n.formatDate(modelData.date, "short")
            }
        }

        // calendars Thunderbird can't export
        Repeater {
            model: Events.skipped
            Item {
                required property var modelData
                width: parent.width
                height: 8 + note.height + 2
                Rectangle {
                    id: note
                    x: 4
                    y: 8
                    width: parent.width - 8
                    height: noteText.implicitHeight + 14
                    radius: 9
                    color: Theme.mix(Theme.warn, 0.12)
                    Icon { x: 9; y: 8; name: "triangle-alert"; size: 14; color: Theme.warn }
                    Text {
                        id: noteText
                        x: 9 + 14 + 7
                        y: 7
                        width: parent.width - x - 9
                        wrapMode: Text.Wrap
                        textFormat: Text.StyledText
                        lineHeight: 1.35
                        color: Theme.menuText
                        font { family: Theme.font; pointSize: Theme.px(11.5); weight: Font.Medium }
                        text: I18n.t("calendar.skipped", { name: `<b>${modelData.name}</b>`, reason: I18n.t(`calendar.reasons.${modelData.reason}`) })
                    }
                }
            }
        }
    }

    // .hol: mark, name, region (· optional); padding 5px 8px
    component HolidayRow: Item {
        id: hol
        property var holiday
        property string when: ""
        property int inset: 8
        height: 5 + 14.4 + 5
        Row {
            x: hol.inset
            anchors.verticalCenter: parent.verticalCenter
            spacing: 8
            Rectangle {
                anchors.verticalCenter: parent.verticalCenter
                width: 7
                height: 7
                radius: 3.5
                color: hol.holiday.kind === "optional" ? "transparent" : Cal.regions[hol.holiday.region].color
                border.width: hol.holiday.kind === "optional" ? 1.5 : 0
                border.color: Cal.regions[hol.holiday.region].color
            }
            Label {
                visible: hol.when !== ""
                anchors.verticalCenter: parent.verticalCenter
                width: Math.max(52, implicitWidth)
                text: hol.when
                size: 12
                tnum: true
                color: Theme.menuSub
            }
        }
        Label {
            id: holName
            x: hol.inset + 7 + 8 + (hol.when !== "" ? 52 + 8 : 0)
            anchors.verticalCenter: parent.verticalCenter
            width: holMeta.x - 8 - x
            elide: Text.ElideRight
            text: hol.holiday.name
            size: 12
            color: Theme.menuText
        }
        Label {
            id: holMeta
            x: parent.width - hol.inset - implicitWidth
            anchors.verticalCenter: parent.verticalCenter
            text: root.holidayMeta(hol.holiday)
            size: 11
            color: Theme.menuSub
        }
    }
}
