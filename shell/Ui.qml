pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Io

// The prototype's `ui` slice (prototype/src/state.js): the user's dock
// preferences, saved to the shell's state file, plus transient popover state.
// Only one popover is open at a time (prototype/src/core/popover.js).
Singleton {
    id: root

    // persisted preferences
    property alias theme: prefs.theme
    property alias hidden: prefs.hidden      // widget ids switched off
    property alias wsIcons: prefs.wsIcons
    property alias pet: prefs.pet            // one pet per dock, "" = none
    property alias size: prefs.size
    property alias magnify: prefs.magnify
    property alias locale: prefs.locale      // "" = config.locale, then the system's

    // transient
    property string popover: ""              // "control-center" | "tray" | ""
    property string ccTab: "volume"

    function openPopover(name, tab) {
        if (tab)
            ccTab = tab;
        popover = name;
    }

    function closePopover() {
        popover = "";
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
            property string theme: "glass"
            property var hidden: []
            property bool wsIcons: true
            property string pet: "cat"
            property int size: 52
            property real magnify: 1.75
            property string locale: ""
        }
    }
}
