import QtQuick
import "../.."
import ".."

// One line of the pet picker (prototype: .ps-trigger / .ps-opt in
// control-center.css): the sprite at rest (or an empty slot), the name, then
// a chevron (trigger) or a check (selected option).
Rectangle {
    id: root

    property string pet
    property string label
    property bool chevron: false
    property bool open: false
    property bool selected: false
    signal clicked

    // padding 5px around the 29px sprite, or the 24px empty slot
    height: pet === "" ? 34 : 39
    color: selected ? Theme.mix(Theme.menuAccent, 0.12) : area.containsMouse ? Theme.menuHover : "transparent"

    Row {
        x: 10
        anchors.verticalCenter: parent.verticalCenter
        spacing: 10

        Item {
            anchors.verticalCenter: parent.verticalCenter
            width: 38
            height: 29
            Image {
                visible: root.pet !== ""
                anchors.centerIn: parent
                width: 38
                height: 38 * 36 / 46
                sourceSize: Qt.size(76, 60)
                source: Pets.sprite(root.pet, true)
            }
            // .pet-mini.empty: dashed 30x24 slot
            Canvas {
                visible: root.pet === ""
                anchors.centerIn: parent
                width: 30
                height: 24
                onPaint: {
                    const ctx = getContext("2d");
                    ctx.reset();
                    ctx.strokeStyle = Theme.menuFaint;
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([3 / 1.5, 3 / 1.5]);
                    ctx.beginPath();
                    ctx.roundedRect(0.75, 0.75, width - 1.5, height - 1.5, 7.25, 7.25);
                    ctx.stroke();
                }
            }
        }
        Label {
            anchors.verticalCenter: parent.verticalCenter
            size: 12.5
            color: Theme.menuText
            text: root.label
        }
    }

    Icon {
        visible: root.chevron
        anchors.right: parent.right
        anchors.rightMargin: 10
        anchors.verticalCenter: parent.verticalCenter
        name: "chevron-down"
        size: 16
        color: Theme.menuSub
        rotation: root.open ? 180 : 0
        Behavior on rotation { NumberAnimation { duration: 200; easing.type: Easing.Bezier; easing.bezierCurve: Theme.ease } }
    }
    Icon {
        visible: !root.chevron
        opacity: root.selected ? 1 : 0
        anchors.right: parent.right
        anchors.rightMargin: 10
        anchors.verticalCenter: parent.verticalCenter
        name: "check"
        size: 14
        strokeWidth: 3
        color: Theme.menuAccent
    }

    MouseArea {
        id: area
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: root.clicked()
    }
}
