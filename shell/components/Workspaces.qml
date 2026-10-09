import QtQuick
import Quickshell.Hyprland
import ".."

// Workspace switcher (prototype: components/workspaces). The active workspace
// is an accent pill; occupied ones follow Ui.wsStyle: small circles holding
// their icon from config.workspaces.icons, or their number (the pill shows
// its number too), or plain dots like the empty ones. Click switches.
Row {
    id: root

    spacing: 6

    // regular workspaces only (special ones have negative ids), in order
    readonly property var list: Hyprland.workspaces.values
        .filter(ws => ws.id > 0)
        .sort((a, b) => a.id - b.id)
    readonly property int activeId: Hyprland.focusedMonitor?.activeWorkspace?.id ?? -1

    Repeater {
        model: root.list

        delegate: Item {
            id: slot

            required property var modelData
            readonly property bool active: modelData.id === root.activeId
            readonly property bool occupied: modelData.toplevels.values.length > 0
            readonly property string iconName: Config.workspaceIcons[String(modelData.id)] ?? ""
            readonly property bool showIcon: Ui.wsStyle === "icons" && occupied && !active && iconName !== ""
            // numbers: occupied ones show their id in the icon dot's footprint, the pill too
            readonly property bool showNumber: Ui.wsStyle === "numbers" && (occupied || active)
            readonly property bool big: showIcon || (showNumber && !active)

            width: dot.width
            height: Theme.size
            anchors.verticalCenter: parent?.verticalCenter

            Rectangle {
                id: dot
                anchors.centerIn: parent
                width: slot.active ? 28 : slot.big ? 21 : 9
                height: slot.big || (slot.active && slot.showNumber) ? 21 : 9
                radius: height / 2
                color: slot.active ? Theme.accent : slot.big ? Theme.tileBg : Theme.sub
                opacity: slot.active || slot.big ? 1 : 0.45
                border.width: slot.big ? 1 : 0
                border.color: Theme.tileBorder

                Behavior on width { NumberAnimation { duration: 350; easing.type: Easing.OutBack } }
                Behavior on height { NumberAnimation { duration: 350; easing.type: Easing.OutBack } }
                Behavior on color { ColorAnimation { duration: 300 } }

                // 600 11px tabular, so 1 and 10 share a width
                Label {
                    anchors.centerIn: parent
                    visible: slot.showNumber
                    text: slot.modelData.id
                    size: 11
                    weight: Font.DemiBold
                    tnum: true
                    lineHeight: 11
                    shadow: !slot.active
                    color: slot.active ? Theme.onAccent : Theme.text
                }

                Icon {
                    shadow: true
                    anchors.centerIn: parent
                    visible: slot.showIcon
                    name: slot.iconName
                    size: 12
                    color: Theme.text
                }
            }

            MouseArea {
                anchors.fill: dot
                anchors.margins: -4
                cursorShape: Qt.PointingHandCursor
                onClicked: {
                    Ui.closePopover();
                    slot.modelData.activate();
                }
            }
        }
    }
}
