import QtQuick
import ".."

// Compact grid of quick items, one or more per pane (prototype:
// components/quick). Items flow in columns of two rows; each keeps a fixed
// text width so changing values never shift the dock. Any click on the tile
// opens the control center on the tab of the item under the cursor (a second
// click on the same tab closes it); scroll adjusts volume / brightness.
Tile {
    id: root

    // one slot per mini item: a pane may contribute several; a pane whose
    // backend is missing keeps one slot, greyed out with a dash
    readonly property var slots: Panes.configured.reduce((list, { pane, available }) => {
        if (pane.tabOnly)
            return list;
        const out = available ? Panes.quick(pane.id) : [{ icon: pane.icon, text: "—", tone: "disabled" }];
        return list.concat(out.map(item => Object.assign({ id: pane.id, wheel: available && pane.wheel, width: pane.quickWidth }, item)));
    }, [])
    readonly property bool ccOpen: Ui.popover === "control-center"

    implicitWidth: grid.width + 12 * 2 + 2
    open: ccOpen

    function openTab(tab) {
        tab = tab || Ui.ccTab;
        if (ccOpen && Ui.ccTab === tab)
            Ui.closePopover();
        else
            Ui.openPopover("control-center", tab);
    }

    // the CSS `ch` of the item text: the advance of "0" in 500 11.5px Inter
    // (measured at 23px, since Qt rounds font sizes to whole pixels)
    FontMetrics {
        id: metrics
        font { family: Theme.font; pixelSize: 23; weight: Font.Medium }
    }
    readonly property real ch: metrics.advanceWidth("0") / 2

    MouseArea {
        anchors.fill: parent
        cursorShape: Qt.PointingHandCursor
        acceptedButtons: Qt.LeftButton | Qt.RightButton
        onClicked: root.openTab("")
    }

    Grid {
        id: grid
        x: 13
        anchors.verticalCenter: parent.verticalCenter
        flow: Grid.TopToBottom
        rows: Math.min(2, root.slots.length)
        rowSpacing: 3
        columnSpacing: 12

        Repeater {
            model: root.slots

            delegate: Item {
                id: slot

                required property var modelData
                readonly property color statusColor: Theme.status(modelData.status)
                readonly property bool alarm: modelData.status === "warn" || modelData.status === "crit"

                width: 14 + 5 + root.ch * modelData.width
                height: 14
                opacity: modelData.tone === "muted" ? 0.45 : modelData.tone === "disabled" ? 0.4 : 1

                Icon {
                    shadow: true
                    name: slot.modelData.icon
                    size: 14
                    // the icon always shows the status; the text only when something is wrong
                    color: slot.modelData.status ? slot.statusColor : Theme.sub
                }
                Row {
                    x: 19
                    anchors.verticalCenter: parent.verticalCenter
                    spacing: 5           // the icon's gap
                    Repeater {
                        // one fixed slot per live value (a plain text is one part)
                        model: slot.modelData.parts ?? [[slot.modelData.text, slot.modelData.width]]
                        Label {
                            required property var modelData
                            width: root.ch * modelData[1]
                            shadow: true
                            text: modelData[0]
                            color: slot.alarm ? slot.statusColor : Theme.text
                            size: 11.5
                            tnum: true
                        }
                    }
                }

                MouseArea {
                    anchors.fill: parent
                    cursorShape: Qt.PointingHandCursor
                    acceptedButtons: Qt.LeftButton | Qt.RightButton
                    onClicked: root.openTab(slot.modelData.id)
                    onWheel: wheel => {
                        if (slot.modelData.wheel)
                            Panes.wheel(slot.modelData.id, wheel.angleDelta.y > 0 ? 1 : -1);
                    }
                }
            }
        }
    }

    ControlCenter {
        owner: root
    }
}
