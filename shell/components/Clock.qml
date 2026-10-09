import QtQuick
import Quickshell
import ".."

// Time and date (prototype: components/clock). The calendar popover and the
// event reminder come later.
Rectangle {
    id: root

    implicitWidth: 168
    implicitHeight: Theme.size
    radius: Theme.radius * 0.55 + 4
    color: Theme.tileBg
    border.color: Theme.tileBorder

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
            text: clock.date.toLocaleDateString(Qt.locale("pt_BR"), "ddd, dd 'de' MMM").replace(/\./g, "")
            color: Theme.sub
            font { family: Theme.font; pixelSize: 11; weight: Font.Medium }
        }
    }
}
