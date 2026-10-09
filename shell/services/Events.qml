pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Io
import ".."
import "../lib/calendar.mjs" as Cal

// Calendar events and what's happening now - the prototype's `events` and
// `agenda` slices (prototype/src/services/events.js, agenda.js). Events come
// from ~/.cache/smart-shell/events.json, written by tools/thunderbird-events.py
// on a systemd timer; a missing file means no events. The agenda (event in
// progress, next one within config.events.remindMinutes) is re-evaluated every
// 15 s and whenever the events change.
Singleton {
    id: root

    property var list: []           // [{ title, start, end, allDay, recurring, calendars }]
    property var calendars: ({})    // calendar -> colour
    property var skipped: []        // [{ name, reason }]

    // test events added over IPC, never written anywhere:
    //   qs ipc -p <shell> call events fake "<title>" <startsInMinutes> <durationMinutes> <category>
    //   qs ipc -p <shell> call events clearFake
    property var fakes: []

    property var ongoing: null
    property var upcoming: null
    property var minutes: null

    function load(text) {
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            return;
        }
        calendars = data.calendars ?? {};
        skipped = data.skipped ?? [];
        list = (data.events ?? []).map(e => Object.assign({}, e, {
            start: Cal.parseDate(e.start, e.allDay),
            end: Cal.parseDate(e.end, e.allDay)
        }));
        evaluate();
    }

    function evaluate() {
        const rules = Object.assign({}, Config.events?.categories ?? {});
        // a fake event's category is taken as given
        const a = Cal.agenda(list.concat(fakes), rules, Config.events?.remindMinutes ?? 10);
        for (const key of ["ongoing", "upcoming"])
            if (a[key]?.fake)
                a[key].category = a[key].fakeCategory;
        const same = (x, y) => (!x && !y) || (!!x && !!y && x.title === y.title && +x.start === +y.start);
        if (!same(ongoing, a.ongoing))
            ongoing = a.ongoing;
        if (!same(upcoming, a.upcoming))
            upcoming = a.upcoming;
        if (minutes !== a.minutes)
            minutes = a.minutes;
    }

    IpcHandler {
        target: "events"
        function fake(title: string, startsInMinutes: real, durationMinutes: real, category: string): void {
            const start = new Date(Date.now() + startsInMinutes * 60000);
            root.fakes = root.fakes.concat([{
                title, start, end: new Date(start.getTime() + durationMinutes * 60000), allDay: false,
                recurring: false, calendars: [], fake: true, fakeCategory: category || "personal"
            }]);
            root.evaluate();
        }
        function clearFake(): void {
            root.fakes = [];
            root.evaluate();
        }
    }

    Timer {
        running: true
        repeat: true
        interval: 15000
        onTriggered: root.evaluate()
    }

    FileView {
        path: (Quickshell.env("XDG_CACHE_HOME") || Quickshell.env("HOME") + "/.cache") + "/smart-shell/events.json"
        watchChanges: true
        onFileChanged: reload()
        onLoaded: root.load(text())
    }
}
