pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Io
import ".."

// Red badges on tray icons (config.tray.redBadge, Slack): Slack never sets
// NeedsAttention and its icon is a pixmap whose dot turns red for mentions and
// blue for plain unread messages - sometimes with the same tooltip. The pixmap
// is read straight from D-Bus every 3 s (an image URL can serve a stale copy)
// and its vivid red pixels counted.
Singleton {
    id: root

    property var red: ({})      // StatusNotifierItem Id -> has a red badge

    function count(pixmaps) {
        // a(iiay): take the largest; bytes are ARGB
        const [w, h, bytes] = pixmaps.reduce((a, b) => (b[0] * b[1] > a[0] * a[1] ? b : a), [0, 0, []]);
        let n = 0;
        for (let i = 0; i + 3 < bytes.length; i += 4) {
            const a = bytes[i], r = bytes[i + 1], g = bytes[i + 2], b = bytes[i + 3];
            const hi = Math.max(r, g, b), lo = Math.min(r, g, b);
            if (a >= 128 && hi >= 110 && (hi - lo) / hi >= 0.5 && r === hi && g < r * 0.6 && b < r * 0.6)
                n++;
        }
        return n * 484 / Math.max(1, w * h) >= 4;   // >= 4 pixels at 22x22
    }

    Timer {
        running: (Config.trayRedBadge ?? []).length > 0
        repeat: true
        triggeredOnStart: true
        interval: 3000
        onTriggered: if (!poll.running) poll.running = true
    }

    Process {
        id: poll
        // every registered item whose Id matches config.tray.redBadge: "<id>\t<pixmap json>"
        command: ["sh", "-c", 'words="$1"; '
            + 'busctl --user --json=short get-property org.kde.StatusNotifierWatcher /StatusNotifierWatcher '
            + 'org.kde.StatusNotifierWatcher RegisteredStatusNotifierItems 2>/dev/null '
            + "| grep -o '\"[^\"]*/[^\"]*\"' | tr -d '\"' | while read -r item; do "
            + 'svc=${item%%/*}; path=/${item#*/}; '
            + "id=$(busctl --user get-property \"$svc\" \"$path\" org.kde.StatusNotifierItem Id 2>/dev/null | sed 's/^s \"//; s/\"$//'); "
            + 'echo "$id" | grep -qiE "$words" || continue; '
            + 'printf "%s\\t" "$id"; busctl --user --json=short get-property "$svc" "$path" org.kde.StatusNotifierItem IconPixmap 2>/dev/null || echo "{}"; done',
            "sh", (Config.trayRedBadge ?? []).join("|")]
        stdout: StdioCollector {
            onStreamFinished: {
                const red = {};
                for (const line of text.split("\n").filter(Boolean)) {
                    const i = line.indexOf("\t");
                    try {
                        red[line.slice(0, i)] = root.count(JSON.parse(line.slice(i + 1)).data ?? []);
                    } catch (e) {}
                }
                if (JSON.stringify(red) !== JSON.stringify(root.red))
                    root.red = red;
            }
        }
    }
}
