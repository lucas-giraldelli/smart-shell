import QtQuick
import Quickshell
import "../services"
import ".."
import "ui"

// The clock timer popover (prototype: .timer-menu in components/clock): minutes
// (no limit), an optional name and a colour, then Start (or Enter). While one
// runs it shows what is left, play / pause and stop instead. The next one starts from the
// last minutes, name and colour.
Popover {
    id: root
    name: "timer"
    bubbleWidth: 260
    padding: 10

    // light enough to tint the glass and stay readable as text on it
    readonly property var colors: ["#facc15", "#fb923c", "#f472b6", "#a78bfa", "#38bdf8", "#4ade80"]
    property color picked: Ui.timerLast?.color ?? colors[0]

    function startIt() {
        const minutes = parseInt(minutesBox.input.text) || Ui.timerLast?.minutes || 10;
        if (!(minutes > 0))
            return;
        Countdown.start(minutes, String(root.picked), nameBox.input.text.trim());
        Ui.closePopover();
    }

    // every time it opens: the last values, the minutes selected
    onOpenChanged: if (open && !Countdown.running) {
        minutesBox.input.text = String(Ui.timerLast?.minutes ?? 10);
        nameBox.input.text = Ui.timerLast?.label ?? "";
        picked = Ui.timerLast?.color ?? colors[0];
        minutesBox.input.forceActiveFocus();
        minutesBox.input.selectAll();
    }

    component Field: Rectangle {
        id: box
        property alias input: field
        property string placeholder
        signal accepted
        height: 30
        radius: 8
        color: Theme.menuSurface
        border.color: field.activeFocus ? Theme.menuAccent : Theme.menuStrong
        TextInput {
            id: field
            x: 9
            width: parent.width - 18
            anchors.verticalCenter: parent.verticalCenter
            color: Theme.menuText
            selectionColor: Theme.menuAccent
            font { family: Theme.font; pixelSize: 12; weight: Font.Medium }
            clip: true
            Keys.onReturnPressed: box.accepted()
            Keys.onEnterPressed: box.accepted()
        }
        Label {
            x: 9
            anchors.verticalCenter: parent.verticalCenter
            visible: field.text === ""
            text: box.placeholder
            size: 12
            color: Theme.menuFaint
        }
    }

    Column {
        width: parent.width
        spacing: 10

        Label {
            x: 2
            text: I18n.t("timer.title").toUpperCase()
            size: 10.5
            weight: Font.DemiBold
            letterSpacing: 0.84
            color: Theme.menuFaint
        }

        // running: what is left, and Cancel
        Item {
            visible: Countdown.running
            width: parent.width
            height: 30
            Row {
                x: 2
                anchors.verticalCenter: parent.verticalCenter
                spacing: 8
                Icon {
                    anchors.verticalCenter: parent.verticalCenter
                    name: Countdown.paused ? "pause" : "timer"
                    size: 16
                    color: Countdown.color
                }
                Label {
                    anchors.verticalCenter: parent.verticalCenter
                    text: Countdown.remainingText
                    size: 16
                    weight: Font.DemiBold
                    tnum: true
                    color: Countdown.paused ? Theme.menuSub : Theme.menuText
                }
                Label {
                    anchors.verticalCenter: parent.verticalCenter
                    width: Math.min(implicitWidth, 110)
                    elide: Text.ElideRight
                    text: Countdown.label
                    size: 12
                    color: Theme.menuSub
                }
            }
            Row {
                anchors.right: parent.right
                anchors.verticalCenter: parent.verticalCenter
                spacing: 4
                IconButton {
                    icon: Countdown.paused ? "play" : "pause"
                    onClicked: Countdown.toggle()
                }
                IconButton {
                    icon: "square"
                    onClicked: Countdown.cancel()
                }
            }
        }

        // not running: minutes, name, colour, Start
        Row {
            visible: !Countdown.running
            width: parent.width
            spacing: 8
            Field {
                id: minutesBox
                width: 76
                input.validator: IntValidator { bottom: 1; top: 9999 }
                input.width: 34
                onAccepted: root.startIt()
                Label {
                    x: 46
                    anchors.verticalCenter: parent.verticalCenter
                    text: I18n.t("timer.minutes")
                    size: 12
                    color: Theme.menuSub
                }
            }
            Field {
                id: nameBox
                width: parent.width - minutesBox.width - parent.spacing
                placeholder: I18n.t("timer.name")
                onAccepted: root.startIt()
            }
        }
        Item {
            visible: !Countdown.running
            width: parent.width
            height: 30
            Row {
                x: 2
                anchors.verticalCenter: parent.verticalCenter
                spacing: 8
                Repeater {
                    model: root.colors
                    delegate: Rectangle {
                        required property string modelData
                        readonly property bool chosen: Qt.colorEqual(root.picked, modelData)
                        width: 20
                        height: 20
                        radius: 10
                        color: modelData
                        border.width: chosen ? 2 : 0
                        border.color: Theme.menuText
                        scale: swatchArea.containsMouse && !chosen ? 1.12 : 1
                        Behavior on scale { NumberAnimation { duration: 120 } }
                        MouseArea {
                            id: swatchArea
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: root.picked = parent.modelData
                        }
                    }
                }
            }
            SmallButton {
                anchors.right: parent.right
                anchors.verticalCenter: parent.verticalCenter
                icon: "timer"
                text: I18n.t("timer.start")
                onClicked: root.startIt()
            }
        }
    }
}
