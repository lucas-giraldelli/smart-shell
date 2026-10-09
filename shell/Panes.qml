pragma Singleton

import QtQuick
import Quickshell
import "services"
import "lib/rules.mjs" as Rules

// A pane is one feature of the quick tile + control center
// (prototype/src/components/control-center/panes/index.js):
//   id, icon, requires?   identity and the capability it needs
//   label(id)             its translated name
//   quick(id)             the mini items it puts in the quick tile (none for a tab-only pane)
//   quickWidth            fixed text width of those items in `ch`, so values never shift the dock
//   wheel(id, dir)        scroll on the mini item (+1 up, -1 down)
// The tab itself is components/panes/<Name>Pane.qml.
Singleton {
    id: root

    readonly property var info: ({
        volume: { id: "volume", icon: "volume-2", quickWidth: 4, wheel: true },
        brightness: { id: "brightness", icon: "sun", requires: "ddcutil", quickWidth: 4, wheel: true },
        network: { id: "network", icon: "network", quickWidth: 3 },
        docker: { id: "docker", icon: "container", requires: "docker", quickWidth: 7 },
        system: { id: "system", icon: "cpu" },
        settings: { id: "settings", icon: "sliders-horizontal", tabOnly: true }
    })

    // the rules functions want an object with t() and formatNumber()
    readonly property var i18n: ({ t: (k, p) => I18n.t(k, p), formatNumber: (n, d) => I18n.formatNumber(n, d) })

    // panes listed in config.quick, in config order; `available` is false when
    // the pane's capability is missing (the item and tab are then disabled)
    readonly property var configured: Config.quick
        .map(id => info[id]).filter(Boolean)
        .map(pane => ({ pane, available: Caps.has(pane.requires) }))

    function label(id) {
        return I18n.t(`${id}.label`);
    }

    // -> [{ icon, text, tone?, status?, width? }]
    function quick(id) {
        switch (id) {
        case "volume":
            return [{
                icon: Audio.muted ? "volume-x" : "volume-2",
                text: !Audio.ready ? "—" : Audio.muted ? I18n.t("common.muted") : Audio.volume + "%",
                tone: Audio.muted ? "muted" : ""
            }];
        case "brightness":
            return [{ icon: "sun", text: Brightness.loaded ? Brightness.brightness + "%" : "—" }];
        case "network":
            return [{ icon: "network", text: Network.online ? "ON" : "OFF", status: Network.online ? "ok" : "crit" }];
        case "docker":
            if (!Docker.loaded)
                return [{ icon: "container", text: "—" }];
            return [{
                icon: "container",
                text: Docker.running ? Rules.fmtMem(i18n, Rules.totalMem(Docker)) : I18n.t("common.stopped"),
                status: Rules.dockerStatus(Docker)
            }];
        case "system": {
            const s = SystemStats;
            const mem = Rules.memStatus(s), temp = Rules.tempStatus(s);
            return [
                { icon: "memory-stick", text: `${Math.round(s.memFree)} GiB`, width: 6, status: mem === "ok" ? "" : mem },
                { icon: "cpu", text: `${Math.round(s.load)}% ${s.temp}°`, width: 7, status: temp === "ok" ? "" : temp }
            ];
        }
        }
        return [];
    }

    function wheel(id, dir) {
        if (id === "volume")
            Audio.step(dir);
        else if (id === "brightness")
            Brightness.step(dir);
    }
}
