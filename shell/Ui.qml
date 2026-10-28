pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Hyprland
import "services"

// The prototype `ui` slice (prototype/src/state.js): the user dock
// preferences, saved to the shell state file, plus transient popover state.
// Only one popover is open at a time (prototype/src/core/popover.js).
Singleton {
    id: root

    // persisted preferences
    readonly property string theme: Config.theme     // saved in config.json
    property alias hidden: prefs.hidden      // widget ids switched off
    // workspaces: "icons" | "numbers" | "dots", saved as workspaces.style in
    // config.json; until it is set there, the old on/off switch decides
    readonly property string wsStyle: ["icons", "numbers", "dots"].includes(Config.workspaceStyle)
        ? Config.workspaceStyle : prefs.wsIcons ? "icons" : "dots"
    property alias pet: prefs.pet            // one pet per dock, "" = none
    property alias size: prefs.size
    property alias magnify: prefs.magnify
    property alias locale: prefs.locale      // "" = config.locale, then the system
    property alias prsHidden: prefs.prsHidden    // repos left out of the PR widget
    property alias prsMerged: prefs.prsMerged    // merged PRs kept until dismissed
    property alias prsFollowed: prefs.prsFollowed    // links of other people's PRs to follow
    property alias prsExpanded: prefs.prsExpanded    // repo -> open, as the user left it in the PR widget
    property alias dnd: prefs.dnd                // do not disturb: only rules with `dnd: true` pop up
    property alias weatherFx: prefs.weatherFx    // the current weather drawn inside the dock
    property alias tamaOn: prefs.tamaOn          // Tamagotchi mode: the pet has needs (services/Tama.qml)
    property alias timer: prefs.timer            // the clock timer: { end (ms), color, label } or null (services/Countdown.qml)
    property alias timerLast: prefs.timerLast    // its last minutes, colour and label, to start the next one from

    // transient
    // a fullscreen window or a game (the game submap) has the focus: the dock
    // animations hold still - pets, effects, the music eq and cava
    readonly property bool calm: (Hyprland.focusedMonitor?.activeWorkspace?.hasFullscreen ?? false)
        || Keyboard.submap === "game"
    property string popover: ""              // "control-center" | "tray" | ""
    property string ccTab: "volume"
    property var dockerOpen: ({})           // compose project -> expanded, as the user left it

    // the screen the open popover belongs to: with a dock per screen, only
    // that screen popover opens (two would fight over the focus grab)
    property string popoverScreen: ""

    function openPopover(name, tab, screen) {
        if (tab)
            ccTab = tab;
        popoverScreen = screen || (Hyprland.focusedMonitor?.name ?? "");
        popover = name;
    }

    function closePopover() {
        popover = "";
    }

    function setClockFormat(format) {
        Config.set("clock.format", format);
    }

    function setWsStyle(style) {
        Config.set("workspaces.style", style);
    }

    function setTheme(id) {
        Config.set("theme", id);
    }

    function toggleHidden(id) {
        hidden = hidden.includes(id) ? hidden.filter(h => h !== id) : [...hidden, id];
    }

    // `qs ipc call popover open control-center docker` / `... close`
    IpcHandler {
        target: "popover"
        function open(name: string, tab: string): void {
            root.openPopover(name, tab);
        }
        // the same on one screen: `... call popover openOn music-volume "" SHOTS`
        function openOn(name: string, tab: string, screen: string): void {
            root.openPopover(name, tab, screen);
        }
        function close(): void {
            root.closePopover();
        }
        function current(): string {
            return root.popover;
        }
    }

    FileView {
        path: Quickshell.statePath("ui.json")
        watchChanges: true
        onFileChanged: reload()
        onAdapterUpdated: writeAdapter()
        onLoadFailed: error => {
            if (error === FileViewError.FileNotFound)
                writeAdapter();
        }

        JsonAdapter {
            id: prefs
            property var hidden: []
            property bool wsIcons: true
            property string pet: "cat"
            property int size: 52
            property real magnify: 1.75
            property string locale: ""
            property var prsHidden: []
            property var prsMerged: []
            property var prsFollowed: []
            property var prsExpanded: ({})
            property bool dnd: false
            property bool weatherFx: false
            property bool tamaOn: false
            property var timer: null
            property var timerLast: ({ minutes: 10, color: "#facc15", label: "" })
        }
    }
}
