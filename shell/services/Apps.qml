pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Wayland
import ".."

// The app row's apps - the prototype's `apps` slice: the pinned apps from
// config.apps.pinned (desktop entry ids, in order). An app's windows are the toplevels whose app id matches its
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

    // only the pinned apps, like the prototype's row; one that isn't installed
    // keeps its place (icon by its id) and launching it just tries the id
    readonly property var list: {
        if (!entryCount)
            return [];
        return (Config.apps?.pinned ?? []).map(pin => {
            const { id, name, icon } = typeof pin === "string" ? { id: pin } : pin;
            const entry = DesktopEntries.byId(id) ?? DesktopEntries.heuristicLookup(id);
            return { id, name, icon, entry, windows: entry ? toplevels.filter(matcher(entry)) : toplevels.filter(t => t.appId === id) };
        });
    }

    // an app's icon: the configured one, then Papirus by its id (the prototype's
    // set), then the entry's
    function iconOf(app) {
        return (app.icon && Quickshell.iconPath(app.icon, true)) || Quickshell.iconPath(app.id, true) || Quickshell.iconPath(app.entry?.icon ?? "", true)
            || Quickshell.iconPath("application-x-executable", true);
    }
    function nameOf(app) {
        return app.name ?? app.entry?.name ?? I18n.capitalize(app.id.split(".").pop());
    }

    // running: focus its (most recent) window; otherwise launch it
    function launch(app) {
        if (app.windows.length) {
            app.windows[app.windows.length - 1].activate();
            return false;
        }
        if (app.entry)
            app.entry.execute();
        else
            Quickshell.execDetached([app.id]);
        return true;
    }
    // right click: close its windows
    function close(app) {
        for (const t of app.windows)
            t.close();
    }
}
