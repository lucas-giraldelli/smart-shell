pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Io

// The user's ~/.config/smart-shell/config.json (shape: config/config.example.json),
// reloaded live when the file changes. It is merged over the defaults below the
// same way the prototype does (prototype/src/data/config.js): objects key by
// key, everything else (lists included) replaced.
Singleton {
    id: root

    readonly property var defaults: ({
        dock: [
            { id: "workspaces", widgets: ["workspaces", "capslock"] },
            { id: "apps", widgets: ["apps"] },
            { id: "status", tiles: true, widgets: ["music", "tray", "bluetooth", "quick", "weather", "clock"] }
        ],
        quick: ["volume", "brightness", "docker", "network", "system", "settings"],
        commands: {
            monitor: "kitty --class=btop-float -e btop",
            docker: "kitty --title lazydocker sh -c 'cd ~ && lazydocker'"
        },
        // tray items left out, matched against their id, title or icon name;
        // fcitx5's menu can quit the input method, which breaks typing
        tray: {
            hidden: ["blueman", "bluetooth", "fcitx"],
            // items whose red badge means attention (Slack's mentions; its blue
            // unread dot doesn't count): matched like `hidden`
            redBadge: ["slack"]
        },
        pets: { available: ["cat", "shiba", "fox", "penguin", "bunny", "capy", "frog"] },
        locale: null,
        // holiday regions marked on the calendar (lib/calendar.mjs)
        holidays: ["br", "cba", "us"],
        // calendar events (exported from Thunderbird); categories drive icons
        events: {
            remindMinutes: 10,
            categories: {
                calendars: {},
                keywords: {
                    health: ["médico", "medico", "consulta", "cardiologista", "psicólogo", "psiquiatra", "dentista", "exame", "terapia"]
                }
            }
        },
        // the app row, in order: desktop entry ids, or { id, name?, icon? } to
        // override what the entry says
        apps: { pinned: ["kitty", "zen", "google-chrome", "code", "io.dbeaver.DBeaver", "slack", "whatsapp", "youtube-music", "org.mozilla.Thunderbird", "steam", { id: "nemo", name: "Nemo", icon: "system-file-manager" }, "vlc"] },
        // MPRIS players the music tile never shows (substrings of identity,
        // desktop entry, title, url or command line)
        music: { ignore: ["whatsapp"] },
        // the forecast's place (Open-Meteo); the city is only shown
        weather: { city: "Cuiabá", lat: -15.6, lon: -56.1 },
        workspaces: { icons: {} }
    })

    readonly property var data: {
        let user = {};
        try {
            user = JSON.parse(file.text() || "{}");
        } catch (e) {
            console.warn("[config] invalid JSON:", e);
        }
        return merge(JSON.parse(JSON.stringify(defaults)), user);
    }

    readonly property var dock: data.dock
    readonly property var quick: data.quick
    readonly property var commands: data.commands
    readonly property var pets: data.pets.available
    readonly property var trayHidden: data.tray.hidden
    readonly property var trayRedBadge: data.tray.redBadge ?? []
    readonly property var locale: data.locale
    readonly property var weather: data.weather
    readonly property var music: data.music
    readonly property var apps: data.apps
    readonly property var holidays: data.holidays
    readonly property var events: data.events
    // workspace id -> Lucide icon name
    readonly property var workspaceIcons: data.workspaces?.icons ?? ({})

    function isObject(v) {
        return v !== null && typeof v === "object" && !Array.isArray(v);
    }

    function merge(target, source) {
        for (const key of Object.keys(source)) {
            if (isObject(source[key]) && isObject(target[key]))
                merge(target[key], source[key]);
            else
                target[key] = source[key];
        }
        return target;
    }

    FileView {
        id: file
        path: (Quickshell.env("XDG_CONFIG_HOME") || Quickshell.env("HOME") + "/.config") + "/smart-shell/config.json"
        watchChanges: true
        onFileChanged: reload()
    }
}
