pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Io

// The user's ~/.config/smart-shell/config.json (shape: config/config.example.json),
// reloaded live when the file changes. Missing keys fall back to the defaults here.
Singleton {
    id: root

    readonly property var data: {
        try {
            return JSON.parse(file.text() || "{}");
        } catch (e) {
            console.warn("[config] invalid JSON:", e);
            return {};
        }
    }

    // workspace id -> Lucide icon name
    readonly property var workspaceIcons: data.workspaces?.icons ?? ({})

    FileView {
        id: file
        path: (Quickshell.env("XDG_CONFIG_HOME") || Quickshell.env("HOME") + "/.config") + "/smart-shell/config.json"
        watchChanges: true
        onFileChanged: reload()
    }
}
