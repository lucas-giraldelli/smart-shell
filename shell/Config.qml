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
            docker: "kitty --title lazydocker sh -c 'cd ~ && lazydocker'",
            // starts / stops a screen recording (the dock's record indicator stops it)
            record: "~/.config/hypr/scripts/record-toggle.sh"
        },
        // tray items left out, matched against their id, title or icon name;
        // fcitx5's menu can quit the input method, which breaks typing
        tray: {
            hidden: ["blueman", "bluetooth", "fcitx"],
            // items whose red badge means attention (Slack's mentions; its blue
            // unread dot doesn't count): matched like `hidden`
            redBadge: ["slack"]
        },
        // pets dance while one of these players plays (substrings of its url,
        // identity, desktop entry or command line): YouTube Music
        pets: { available: ["cat", "shiba", "fox", "penguin", "bunny", "capy", "frog", "duck", "corgi", "panda", "owl", "turtle", "octopus", "macaw", "anteater", "ghost", "blackcat", "pig"], danceWith: ["music.youtube.com"] },
        locale: null,
        theme: "glass",
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
        // one set of thresholds for the quick tile's colours and the pets
        // (see the README): cpu % - the pet sleeps / idles / walks below
        // these, runs above; free RAM in GiB - warn colours, a heavy pet;
        // die temperature (Tccd1) - warn colours, a reddish pet; with
        // roomTemp set, warn / crit are degrees over it
        thresholds: {
            cpu: { sleep: 15, idle: 50, walk: 85 },
            memFreeGiB: { warn: 8, crit: 4 },
            tempC: { warn: 85, crit: 99, roomTemp: null }
        },
        // the VPN profile the network tab uses (an openvpn3 config or a
        // NetworkManager connection name); null = the first openvpn3 config
        vpn: { profile: null },
        // the clock: "24h" or "12h", whatever the language
        clock: { format: "24h" },
        // the forecast's place (Open-Meteo); the city is only shown
        weather: { city: "Cuiabá", lat: -15.6, lon: -56.1 },
        workspaces: { icons: {} },
        // notification popups: rules restyle some, matched (substring, any
        // case) on appName / summary / body - `title` replaces the summary,
        // `app` the app's name, `icon` its icon, `focusTitle` a regex picking
        // which of the app's windows a click brings forward, `style: "love"` the wine look, `timeout` in ms
        // (0 = until closed)
        notifications: { rules: [] }
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
    readonly property var petsConfig: data.pets
    readonly property var trayHidden: data.tray.hidden
    readonly property var trayRedBadge: data.tray.redBadge ?? []
    readonly property var locale: data.locale
    readonly property string theme: data.theme ?? "glass"
    readonly property var weather: data.weather
    readonly property var music: data.music
    readonly property var thresholds: data.thresholds
    readonly property var vpn: data.vpn
    // audio devices by PipeWire node.name: { name, hidden }
    readonly property var audioDevices: data.audio?.devices ?? ({})
    readonly property var apps: data.apps
    readonly property var holidays: data.holidays
    readonly property var events: data.events
    readonly property var notificationRules: data.notifications?.rules ?? []
    // "icons" | "numbers" | "dots", or undefined (Ui falls back to its old switch)
    readonly property var workspaceStyle: data.workspaces?.style
    readonly property string clockFormat: data.clock?.format === "12h" ? "12h" : "24h"
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

    // change one key of the user's file ("theme", "workspaces.style" - the
    // dock settings); the rest of the file is kept, reformatted as JSON
    function set(key, value) {
        setIn(key.split("."), value);
    }
    // the same with an explicit path, for keys that contain dots (PipeWire
    // node names); `undefined` removes the key
    function setIn(path, value) {
        let user = {};
        try {
            user = JSON.parse(file.text() || "{}");
        } catch (e) {
            console.warn("[config] not saving", path.join("."), "- the file isn't valid JSON:", e);
            return;
        }
        let node = user;
        for (const part of path.slice(0, -1)) {
            if (!isObject(node[part]))
                node[part] = {};
            node = node[part];
        }
        if (value === undefined)
            delete node[path[path.length - 1]];
        else
            node[path[path.length - 1]] = value;
        file.setText(JSON.stringify(user, null, 2) + "\n");
    }

    FileView {
        id: file
        path: (Quickshell.env("XDG_CONFIG_HOME") || Quickshell.env("HOME") + "/.config") + "/smart-shell/config.json"
        watchChanges: true
        onFileChanged: reload()
    }
}
