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
        volume: { id: "volume", icon: "volume-2", quickWidth: 4.6, wheel: true },     // fits "100%"
        brightness: { id: "brightness", icon: "sun", requires: "ddcutil", quickWidth: 4.6, wheel: true },
        network: { id: "network", icon: "network", quickWidth: 4.7 },   // fits "VPN…"
        docker: { id: "docker", icon: "container", requires: "docker", quickWidth: 7.3 },  // fits "1023 MiB"
        system: { id: "system", icon: "cpu" },
        settings: { id: "settings", icon: "sliders-horizontal", tabOnly: true }
    })

    // the rules functions want an object with t() and formatNumber()
    readonly property var i18n: ({ t: (k, p) => I18n.t(k, p), formatNumber: (n, d) => I18n.formatNumber(n, d) })

    // panes listed in config.quick, in config order; `available` is false when
    // the pane capability is missing (the item and tab are then disabled)
    readonly property var configured: Config.quick
        .map(id => info[id]).filter(Boolean)
        .map(pane => ({ pane, available: Caps.has(pane.requires) }))

    function label(id) {
        return I18n.t(`${id}.label`);
    }

    // -> [{ icon, text | parts, tone?, status?, width? }]; parts: [[value, width in ch], ...]
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
            // a VPN takes over the item: shield + "VPN", pulsing while it connects
            if (!Network.online)
                return [{ icon: "network", text: "OFF", status: "crit" }];
            if (Network.vpnOn)
                return [{ icon: "shield-check", text: "VPN", status: "ok", colorText: true, tip: I18n.t("network.vpnOnTip", { server: Network.vpnServer || Network.vpn }) }];
            if (Network.vpnBusy)
                return [{ icon: "shield", text: "VPN…", status: "warn", pulse: true, tip: I18n.t(`network.vpnStates.${Network.vpnState}`) }];
            return [{ icon: "network", text: "ON", status: "ok" }];
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
            const mem = Rules.memStatus(s, Config.thresholds), temp = Rules.tempStatus(s, Config.thresholds);
            return [
                { icon: "memory-stick", text: `${Math.round(s.memFree)} GiB`, width: 6, status: mem === "ok" ? "" : mem },
                // load and temperature left-aligned in fixed slots exactly as wide as
                // "100%" and "100°" (tabular 11.5px Inter), 5px apart like icon and
                // text: the temperature always starts at the same x
                { icon: "cpu", parts: [[`${Math.round(s.load)}%`, 4.55], [`${s.temp}°`, 3.72]], width: 8.95, status: temp === "ok" ? "" : temp }
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
