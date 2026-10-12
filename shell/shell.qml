//@ pragma UseQApplication
//@ pragma IconTheme Papirus-Dark
import QtQuick
import Quickshell
import Quickshell.Wayland
import Quickshell.Hyprland
import "components"
import "services"

// Entry point: one dock per screen, as a layer surface along the bottom edge.
// The surface is taller than the bar (room for magnified icons, the pet and
// popovers later) and transparent; the input mask keeps clicks outside the bar
// going to the windows underneath. Blur comes from a Hyprland layer rule on the
// "smart-shell" namespace. Notification popups get a window of their own
// on the Overlay layer, above windows.
ShellRoot {
    Variants {
        model: Quickshell.screens

        Scope {
            id: perScreen

            required property var modelData

            PanelWindow {
                id: window

                screen: perScreen.modelData

                anchors { bottom: true; left: true; right: true }
                implicitHeight: 140
                exclusiveZone: dock.height + Theme.edge
                color: "transparent"

                WlrLayershell.namespace: "smart-shell"
                WlrLayershell.layer: WlrLayer.Top
                // the timer popover has text fields: while it is open a click
                // can bring the keyboard here (a popup only gets keys its
                // layer surface takes)
                WlrLayershell.keyboardFocus: Ui.popover === "timer" && Ui.popoverScreen === perScreen.modelData.name
                    ? WlrKeyboardFocus.OnDemand : WlrKeyboardFocus.None

                mask: Region {
                    item: dock
                    Region { item: dock.appsHit }
                    Region { item: pet.visible ? pet : null }
                }

                // the pet walks on the dock top edge, drawn behind the dock
                Pet {
                    id: pet
                    floor: dock
                }

                Dock {
                    id: dock
                    anchors.horizontalCenter: parent.horizontalCenter
                    anchors.bottom: parent.bottom
                    anchors.bottomMargin: Theme.edge
                }
            }

            // notification popups: stacked above the dock right end, clear
            // of the pet, on the focused screen only; clicks outside the cards
            // go through
            PanelWindow {
                screen: perScreen.modelData
                visible: Notifications.popups.length > 0 && Hyprland.focusedMonitor?.name === perScreen.modelData.name

                anchors { bottom: true; left: true; right: true }
                implicitHeight: 620
                exclusionMode: ExclusionMode.Ignore
                color: "transparent"

                WlrLayershell.namespace: "smart-shell"
                WlrLayershell.layer: WlrLayer.Overlay

                mask: Region { item: stack }

                Column {
                    id: stack
                    x: (parent.width + dock.width) / 2 - width
                    anchors.bottom: parent.bottom
                    anchors.bottomMargin: Theme.edge + dock.height + 40
                    width: 380
                    spacing: 8

                    Repeater {
                        model: Notifications.popups
                        delegate: NotificationCard {}
                    }
                }
            }
        }
    }
}
