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
        // tray items left out, matched against their id, title or icon name
        tray: { hidden: ["blueman", "bluetooth"] },
        pets: { available: ["cat", "shiba", "fox", "penguin", "bunny", "capy", "frog"] },
        locale: null,
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
    readonly property var locale: data.locale
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
