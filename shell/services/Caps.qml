pragma Singleton

import QtQuick
import Quickshell
import Quickshell.Io

// Which optional backends exist on this machine - the prototype's `caps` slice
// (prototype/src/data/capabilities.js). Features whose backend is missing stay
// visible but disabled.
Singleton {
    id: root

    property bool bluetooth: true
    property bool ddcutil: true
    property bool docker: true
    property bool hyprsunset: true

    function has(cap) {
        return !cap || root[cap] === true;
    }

    Process {
        running: true
        command: ["sh", "-c", "for c in ddcutil docker hyprsunset; do command -v $c >/dev/null && echo $c; done; ls /sys/class/bluetooth 2>/dev/null | grep -q . && echo bluetooth"]
        stdout: StdioCollector {
            onStreamFinished: {
                const found = text.split("\n");
                for (const cap of ["bluetooth", "ddcutil", "docker", "hyprsunset"])
                    root[cap] = found.includes(cap);
            }
        }
    }
}
