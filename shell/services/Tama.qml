pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Io
import ".."
import "../lib/tama-rules.mjs" as Rules
import "../lib/rules.mjs" as Status

// Tamagotchi mode for the dock's pet (Ui.tamaOn; prototype: pets/tama.js).
// The rules are shared with the prototype (lib/tama-rules.mjs); this keeps the
// state - saved to the shell's state file - and runs them once a second: the
// needs run down, a busy or hot PC and the hour play their part, and at zero
// health the pet runs away and comes back as the ghost. A care action from
// the pet's menu goes through care(); `acted` tells the pet what to act out.
Singleton {
    id: root

    property var s: Rules.fresh(Date.now())
    property var petted: []       // recent pets (ms), for the diminishing returns
    property bool loaded: false   // the state file read: only then does time pass
    readonly property string kind: Ui.pet
    readonly property var species: Pets.species[kind] ?? null
    readonly property bool on: Ui.tamaOn && species !== null
    readonly property string need: on ? Rules.urgent(s, Date.now()) : ""
    readonly property string food: Rules.foodOf(species)

    // a word (pets.says) and a care animation (poses.js carePose)
    signal acted(string say, string effect)

    function set(n) {
        s = n;
        store.state = n;
    }

    function care(action) {
        const now = Date.now();
        const r = Rules.care(s, action, { sp: species, kind, petted, now });
        if (action === "pet")
            petted = petted.filter(p => now - p < 120e3).concat([now]);
        if (r.n)
            set(r.n);
        acted(r.say ?? "", r.effect ?? "");
    }

    function ageText() {
        const d = Rules.ageDays(s, Date.now(), 1);
        return d < 1 ? I18n.t("tama.hours", { h: Math.floor(d * 24) }) : I18n.t("tama.days", { d: Math.floor(d) });
    }

    Timer {
        running: root.on && root.loaded
        repeat: true
        interval: 1000
        onTriggered: {
            const thresholds = Config.thresholds;
            const n = Rules.decay(root.s, 1, {
                sp: root.species,
                asleep: root.s.napping || SystemStats.load < thresholds.cpu.sleep,
                hot: Status.tempStatus(SystemStats, thresholds) === "crit" || Status.memStatus(SystemStats, thresholds) === "crit",
                load: SystemStats.load,
                music: Media.dancing,
                meeting: (Events.ongoing?.category ?? "") === "work",
                now: Date.now(),
                speed: 1
            });
            if (n)
                return root.set(n);
            // it ran away: back as the ghost
            Quickshell.execDetached(["notify-send", "-a", "smart-shell",
                I18n.t("tama.ranAway", { name: I18n.t(`pets.names.${root.kind}`) }), I18n.t("tama.ranAwayBody")]);
            root.set(Rules.fresh(Date.now()));
            Ui.pet = "ghost";
        }
    }

    // `qs ipc call pet care feed` (pet, feed, play, clean, medicine, sleep)
    IpcHandler {
        target: "pet"
        function care(action: string): void {
            if (root.on)
                root.care(action);
        }
    }

    FileView {
        path: Quickshell.statePath("tama.json")
        onAdapterUpdated: writeAdapter()
        onLoaded: {
            if (store.state && store.state.bornAt)
                root.s = store.state;
            root.loaded = true;
        }
        onLoadFailed: error => {
            if (error === FileViewError.FileNotFound) {
                store.state = root.s;
                writeAdapter();
            }
            root.loaded = true;
        }

        JsonAdapter {
            id: store
            property var state: null
        }
    }
}
