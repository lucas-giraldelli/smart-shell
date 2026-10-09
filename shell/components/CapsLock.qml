import QtQuick
import QtQuick.Effects
import "../services"
import ".."

// Caps Lock indicator for keyboards without an LED (prototype:
// components/capslock): always visible, white when off and the ok-green with
// a glow when on, giving a small hop now and then. Same footprint in both
// states, so toggling never shifts the dock. While Hyprland's resize submap
// is on (Alt+R) a resize indicator shows to its right, in the same style.
Item {
    id: root

    readonly property bool on: Keyboard.capsLock
    readonly property bool hovered: hover.hovered

    readonly property bool resizing: Keyboard.submap === "resize"
    implicitWidth: resizing ? 24 + 6 + 24 : 24
    Behavior on implicitWidth { NumberAnimation { duration: 250; easing.type: Easing.Bezier; easing.bezierCurve: Theme.ease } }
    implicitHeight: Theme.size

    // the resize submap: accent with a glow, like caps lock's green
    Item {
        id: resize
        x: 24 + 6
        width: 24
        height: 24
        anchors.verticalCenter: parent.verticalCenter
        opacity: root.resizing ? 1 : 0
        scale: root.resizing ? 1 : 0.6
        visible: opacity > 0
        Behavior on opacity { NumberAnimation { duration: 200 } }
        Behavior on scale { NumberAnimation { duration: 250; easing.type: Easing.OutBack } }

        Icon {
            id: resizeIcon
            anchors.centerIn: parent
            name: "scaling"
            size: 15
            color: Theme.accent
        }
        MultiEffect {
            anchors.fill: resizeIcon
            source: resizeIcon
            shadowEnabled: true
            shadowColor: Theme.mix(Theme.accent, 0.6)
            shadowBlur: 0.5
            shadowHorizontalOffset: 0
            shadowVerticalOffset: 0
        }
        HoverHandler { id: resizeHover }
        Tip {
            target: resize
            text: I18n.t("keyboard.resize")
            shown: resizeHover.hovered
        }
    }

    HoverHandler { id: hover }

    Tip {
        target: dot
        text: I18n.t(root.on ? "capslock.on" : "capslock.off")
        shown: root.hovered
    }

    Item {
        id: dot
        width: 24
        height: 24
        anchors.verticalCenter: parent.verticalCenter

        Icon {
            id: arrow
            anchors.centerIn: parent
            name: "arrow-big-up-dash"
            size: 15
            shadow: !root.on
            color: root.on ? Theme.ok : Theme.text
            Behavior on color { ColorAnimation { duration: 100 } }

            transform: Translate { id: hop }
            // while on, the arrow gives a small hop now and then (1.6 s cycle)
            SequentialAnimation {
                running: root.on
                loops: Animation.Infinite
                onRunningChanged: if (!running) hop.y = 0
                NumberAnimation { target: hop; property: "y"; to: -2.5; duration: 240; easing.type: Easing.Bezier; easing.bezierCurve: [0.3, 0.7, 0.4, 1, 1, 1] }
                NumberAnimation { target: hop; property: "y"; to: 0.5; duration: 208; easing.type: Easing.Bezier; easing.bezierCurve: [0.3, 0.7, 0.4, 1, 1, 1] }
                NumberAnimation { target: hop; property: "y"; to: 0; duration: 192; easing.type: Easing.Bezier; easing.bezierCurve: [0.3, 0.7, 0.4, 1, 1, 1] }
                PauseAnimation { duration: 960 }
            }
        }

        // drop-shadow(0 0 5px ok 60%)
        MultiEffect {
            visible: root.on
            anchors.fill: arrow
            source: arrow
            shadowEnabled: true
            shadowColor: Theme.mix(Theme.ok, 0.6)
            shadowBlur: 0.5
            shadowHorizontalOffset: 0
            shadowVerticalOffset: 0
            transform: Translate { y: hop.y }
        }
    }
}
