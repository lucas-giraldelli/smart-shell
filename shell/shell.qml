//@ pragma UseQApplication
import QtQuick
import Quickshell
import Quickshell.Wayland
import "components"

// Entry point: one dock per screen, as a layer surface along the bottom edge.
// The surface is taller than the bar (room for magnified icons, the pet and
// popovers later) and transparent; the input mask keeps clicks outside the bar
// going to the windows underneath. Blur comes from a Hyprland layer rule on the
// "smart-shell" namespace.
ShellRoot {
    Variants {
        model: Quickshell.screens

        PanelWindow {
            id: window

            required property var modelData
            screen: modelData

            anchors { bottom: true; left: true; right: true }
            implicitHeight: 140
            exclusiveZone: dock.height + Theme.edge
            color: "transparent"

            WlrLayershell.namespace: "smart-shell"
            WlrLayershell.layer: WlrLayer.Top

            mask: Region { item: dock }

            Dock {
                id: dock
                anchors.horizontalCenter: parent.horizontalCenter
                anchors.bottom: parent.bottom
                anchors.bottomMargin: Theme.edge
            }
        }
    }
}
