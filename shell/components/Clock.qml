import QtQuick
import Quickshell
import ".."

// Time and date (prototype: components/clock). The calendar popover and the
// event reminder come later.
Tile {
    id: root

    implicitWidth: 168

    MouseArea {
        anchors.fill: parent
        cursorShape: Qt.PointingHandCursor
        onClicked: Ui.closePopover()
    }

    SystemClock {
        id: clock
        precision: SystemClock.Minutes
    }

    Column {
        anchors.verticalCenter: parent.verticalCenter
        anchors.left: parent.left
        anchors.leftMargin: 14
        spacing: 2

        Text {
            text: Qt.formatTime(clock.date, "HH:mm")
            color: Theme.text
            font { family: Theme.font; pixelSize: 20; weight: Font.DemiBold }
        }
        Text {
            text: {
                const d = clock.date.toLocaleDateString(Qt.locale("pt_BR"), "ddd, dd 'de' MMM").replace(/\./g, "");
                return d.charAt(0).toUpperCase() + d.slice(1);
            }
            color: Theme.sub
            font { family: Theme.font; pixelSize: 11; weight: Font.Medium }
        }
    }
}
