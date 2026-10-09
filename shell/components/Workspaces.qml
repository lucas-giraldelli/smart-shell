import QtQuick
import Quickshell.Hyprland
import ".."

// Workspace switcher (prototype: components/workspaces). The active workspace
// is an accent pill; occupied ones are small circles holding their icon from
// config.workspaces.icons; empty ones are plain dots. Click switches.
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
            readonly property bool showIcon: Ui.wsIcons && occupied && !active && iconName !== ""

            width: dot.width
            height: Theme.size
            anchors.verticalCenter: parent?.verticalCenter

            Rectangle {
                id: dot
                anchors.centerIn: parent
                width: slot.active ? 28 : slot.showIcon ? 21 : 9
                height: slot.showIcon ? 21 : 9
                radius: height / 2
                color: slot.active ? Theme.accent : slot.showIcon ? Theme.tileBg : Theme.sub
                opacity: slot.active || slot.showIcon ? 1 : 0.45
                border.width: slot.showIcon ? 1 : 0
                border.color: Theme.tileBorder

                Behavior on width { NumberAnimation { duration: 350; easing.type: Easing.OutBack } }
                Behavior on height { NumberAnimation { duration: 350; easing.type: Easing.OutBack } }
                Behavior on color { ColorAnimation { duration: 300 } }

                Icon {
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
