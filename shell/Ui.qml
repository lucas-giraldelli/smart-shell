pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Hyprland

// The prototype's `ui` slice (prototype/src/state.js): the user's dock
// preferences, saved to the shell's state file, plus transient popover state.
// Only one popover is open at a time (prototype/src/core/popover.js).
Singleton {
    id: root

    // persisted preferences
    readonly property string theme: Config.theme     // saved in config.json
    property alias hidden: prefs.hidden      // widget ids switched off
    // workspaces: "icons" | "numbers" | "dots", saved as workspaces.style in
    // config.json; until it's set there, the old on/off switch decides
    readonly property string wsStyle: ["icons", "numbers", "dots"].includes(Config.workspaceStyle)
        ? Config.workspaceStyle : prefs.wsIcons ? "icons" : "dots"
    property alias pet: prefs.pet            // one pet per dock, "" = none
    property alias size: prefs.size
    property alias magnify: prefs.magnify
    property alias locale: prefs.locale      // "" = config.locale, then the system's

    // transient
    // a fullscreen window is focused: pets and effects hold still
    readonly property bool calm: Hyprland.focusedMonitor?.activeWorkspace?.hasFullscreen ?? false
    property string popover: ""              // "control-center" | "tray" | ""
    property string ccTab: "volume"
    property var dockerOpen: ({})           // compose project -> expanded, as the user left it

    function openPopover(name, tab) {
        if (tab)
            ccTab = tab;
        popover = name;
    }

    function closePopover() {
        popover = "";
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
        }
    }
}
