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
        const a = Cal.agenda(list, Config.events?.categories ?? {}, Config.events?.remindMinutes ?? 10);
        const same = (x, y) => (!x && !y) || (!!x && !!y && x.title === y.title && +x.start === +y.start);
        if (!same(ongoing, a.ongoing))
            ongoing = a.ongoing;
        if (!same(upcoming, a.upcoming))
            upcoming = a.upcoming;
        if (minutes !== a.minutes)
            minutes = a.minutes;
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
