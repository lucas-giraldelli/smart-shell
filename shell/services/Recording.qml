pragma Singleton
import QtQuick
import Quickshell
import Quickshell.Io
import ".."

// A screen recording in progress (gpu-screen-recorder, started by the user's
// Alt+Print script): the caps lock area shows a red dot and the elapsed time,
// and a click stops it (config.commands.record). The script tells the dock
// over IPC (`qs ipc call recording started|stopped`); a check every 3 s
// catches a recorder that ended on its own.
Singleton {
    id: root

    property bool active: false
    property date since: new Date()
    property int seconds: 0

    function stop() {
        Quickshell.execDetached(["sh", "-c", Config.commands.record]);
    }

    IpcHandler {
        target: "recording"
        function started(): void {
            root.since = new Date();
            root.seconds = 0;
            root.active = true;
        }
        function stopped(): void {
            root.active = false;
        }
    }

    Timer {
        running: root.active
        repeat: true
        interval: 1000
        onTriggered: root.seconds = Math.round((Date.now() - root.since.getTime()) / 1000)
    }
    Timer {
        running: true
        repeat: true
        triggeredOnStart: true
        interval: 3000
        onTriggered: check.running = true
    }
    Process {
        id: check
        // the process name is cut to 15 characters
        command: ["pgrep", "-x", "gpu-screen-reco"]
        onExited: code => {
            const running = code === 0;
            if (running && !root.active) {
                root.since = new Date();
                root.active = true;
            } else if (!running && root.active && Date.now() - root.since.getTime() > 3000) {
                // (a grace period: the script says "started" just before the recorder runs)
                root.active = false;
            }
        }
    }
}
