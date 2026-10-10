import QtQuick
import Quickshell
import Quickshell.Widgets
import "../services"
import ".."
import "ui"

// One notification popup (prototype: components/notifications): the sender's
// picture (or the app's icon) with the app's icon as a badge, app and time,
// the title, the message in up to 2 lines and the actions, in the dock's
// glass. Click runs the default action; hover holds the timer and shows ×.
Rectangle {
    id: root

    required property var modelData
    readonly property var n: modelData.notif
    readonly property bool love: modelData.style === "love"
    readonly property string appIconSource: n.appIcon
        ? (n.appIcon.startsWith("/") || n.appIcon.includes("://") ? n.appIcon : Quickshell.iconPath(n.appIcon, true))
        : (n.desktopEntry ? Quickshell.iconPath(DesktopEntries.byId(n.desktopEntry)?.icon ?? "", true) : "")
    readonly property var actions: n.actions.filter(a => a.identifier !== "default")
    property date time: new Date()

    width: 380
    height: Math.max(40, text.implicitHeight) + 24
    radius: 16
    color: love ? Qt.rgba(0.30, 0.02, 0.10, 0.72) : Theme.menuBg
    border.width: love ? 1.5 : 1
    border.color: love ? Qt.rgba(0.96, 0.25, 0.37, 0.65) : modelData.critical ? Theme.mix(Theme.crit, 0.7) : Theme.menuLine

    // in: fade and rise
    opacity: 0
    transform: Translate { id: rise; y: 10 }
    Component.onCompleted: enter.start()
    ParallelAnimation {
        id: enter
        NumberAnimation { target: root; property: "opacity"; to: 1; duration: 320; easing.type: Easing.OutCubic }
        NumberAnimation { target: rise; property: "y"; to: 0; duration: 320; easing.type: Easing.OutBack }
    }

    HoverHandler { id: hover }
    Timer {
        running: root.modelData.timeout > 0 && !hover.hovered
        interval: root.modelData.timeout
        onTriggered: Notifications.hide(root.modelData.id)
    }
    MouseArea {
        anchors.fill: parent
        cursorShape: Qt.PointingHandCursor
        onClicked: {
            const def = root.n.actions.find(a => a.identifier === "default");
            if (def)
                def.invoke();
            Notifications.dismiss(root.modelData.id);
        }
    }

    // .nf-pic: 40px, round picture + app badge, or the app's icon
    Item {
        id: pic
        x: 12
        y: 12
        width: 40
        height: 40
        ClippingRectangle {
            visible: root.n.image !== ""
            anchors.fill: parent
            radius: 20
            color: "transparent"
            Image {
                anchors.fill: parent
                source: root.n.image
                fillMode: Image.PreserveAspectCrop
                sourceSize: Qt.size(80, 80)
            }
        }
        IconImage {
            visible: root.n.image === "" && root.appIconSource !== ""
            anchors.centerIn: parent
            implicitSize: 34
            source: root.appIconSource
        }
        // nothing to show: a bell in the theme's colours
        Rectangle {
            visible: root.n.image === "" && root.appIconSource === ""
            anchors.fill: parent
            radius: 20
            color: Theme.menuSurface
            Icon {
                anchors.centerIn: parent
                name: "bell"
                size: 18
                color: Theme.menuSub
            }
        }
        Rectangle {
            visible: root.n.image !== "" && root.appIconSource !== ""
            x: 25
            y: 25
            width: 18
            height: 18
            radius: 6
            color: Theme.menuBg
            IconImage {
                anchors.centerIn: parent
                implicitSize: 16
                source: root.appIconSource
            }
        }
    }

    Column {
        id: text
        x: 64
        y: 12
        width: parent.width - x - 12
        spacing: 2

        // app · time, × on hover
        Item {
            width: parent.width
            height: 16
            Row {
                anchors.verticalCenter: parent.verticalCenter
                spacing: 6
                Label { size: 11; weight: Font.DemiBold; color: Theme.menuSub; text: root.modelData.appName }
                Label { size: 11; color: Theme.menuSub; text: "· " + Qt.formatTime(root.time, "HH:mm") }
            }
            IconButton {
                anchors.right: parent.right
                anchors.verticalCenter: parent.verticalCenter
                implicitWidth: 20
                implicitHeight: 20
                radius: 6
                flat: true
                icon: "x"
                iconSize: 13
                opacity: hover.hovered ? 1 : 0
                onClicked: Notifications.dismiss(root.modelData.id)
            }
        }
        Row {
            width: parent.width
            spacing: 6
            Icon {
                visible: root.love
                anchors.verticalCenter: parent.verticalCenter
                name: "heart-filled"
                size: 14
                color: "#fda4af"
                SequentialAnimation on scale {
                    running: root.love
                    loops: Animation.Infinite
                    NumberAnimation { to: 1.25; duration: 180 }
                    NumberAnimation { to: 1; duration: 180 }
                    NumberAnimation { to: 1.15; duration: 180 }
                    NumberAnimation { to: 1; duration: 660 }
                }
            }
            Label {
                width: parent.width - (root.love ? 20 : 0)
                size: 13.5
                weight: Font.DemiBold
                elide: Text.ElideRight
                color: root.love ? "#fda4af" : root.modelData.critical ? Theme.crit : Theme.menuText
                text: root.modelData.summary
            }
        }
        Text {
            visible: root.n.body !== ""
            width: parent.width
            wrapMode: Text.Wrap
            maximumLineCount: 2
            elide: Text.ElideRight
            textFormat: Text.StyledText
            lineHeight: 1.12
            font.family: Theme.font
            font.pixelSize: 13
            color: root.love ? "#fecdd3" : Theme.menuSub
            text: root.n.body
            onLinkActivated: link => Qt.openUrlExternally(link)
        }
        Row {
            visible: root.actions.length > 0
            topPadding: 6
            spacing: 6
            Repeater {
                model: root.actions
                delegate: SmallButton {
                    required property var modelData
                    text: modelData.text
                    onClicked: {
                        modelData.invoke();
                        Notifications.dismiss(root.modelData.id);
                    }
                }
            }
        }
    }
}
