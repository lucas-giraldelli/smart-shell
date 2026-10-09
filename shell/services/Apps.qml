pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Wayland
import ".."

// The app row's apps - the prototype's `apps` slice: the pinned apps from
// config.apps.pinned (desktop entry ids, in order), then any other app with a
// window open. An app's windows are the toplevels whose app id matches its
// entry id or StartupWMClass, or - for Chromium web apps, which ignore
// --class on Wayland - the host of its --app= URL.
Singleton {
    id: root

    readonly property var toplevels: ToplevelManager.toplevels.values
    // desktop entries load after start-up; re-read then
    readonly property int entryCount: DesktopEntries.applications.values.length

    function matcher(entry) {
        const ids = [entry.id, entry.startupClass].filter(Boolean).map(s => s.toLowerCase());
        const host = (entry.command.join(" ").match(/--app=https?:\/\/([^/ ]+)/) ?? [])[1];
        return t => {
            const app = (t.appId ?? "").toLowerCase();
            return ids.includes(app) || (!!host && app.includes(host.toLowerCase()));
        };
    }

    readonly property var list: {
        if (!entryCount)
            return [];
        const out = [];
        const claimed = new Set();
        for (const id of Config.apps?.pinned ?? []) {
            const entry = DesktopEntries.byId(id) ?? DesktopEntries.heuristicLookup(id);
            if (!entry)
                continue;
            const match = matcher(entry);
            const windows = toplevels.filter(match);
            windows.forEach(t => claimed.add(t));
            out.push({ id, entry, windows, pinned: true });
        }
        // unpinned apps with windows, one per app id
        const extra = new Map();
        for (const t of toplevels) {
            if (claimed.has(t) || !t.appId)
                continue;
            if (!extra.has(t.appId)) {
                // web apps are found by their --app= host, then by name
                const entry = DesktopEntries.applications.values.find(e => matcher(e)(t)) ?? DesktopEntries.heuristicLookup(t.appId);
                extra.set(t.appId, { id: t.appId, entry, windows: [], pinned: false });
            }
            extra.get(t.appId).windows.push(t);
        }
        return out.concat([...extra.values()]);
    }

    // an app's icon: Papirus by its id first (the prototype's set), then the entry's
    function iconOf(app) {
        return Quickshell.iconPath(app.id, true) || Quickshell.iconPath(app.entry?.icon ?? "", true)
            || Quickshell.iconPath("application-x-executable", true);
    }
    function nameOf(app) {
        return app.entry?.name ?? app.windows[0]?.title ?? app.id;
    }

    // running: focus its (most recent) window; otherwise launch it
    function launch(app) {
        if (app.windows.length) {
            app.windows[app.windows.length - 1].activate();
            return false;
        }
        app.entry?.execute();
        return true;
    }
    // right click: close its windows
    function close(app) {
        for (const t of app.windows)
            t.close();
    }
}
