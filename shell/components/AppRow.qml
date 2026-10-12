import QtQuick
import QtQuick.Effects
import Qt5Compat.GraphicalEffects as GE
import "../services"
import ".."

// Pinned and running apps with macOS-style magnification (prototype:
// components/app-row). Icons grow towards the cursor with a cosine falloff
// over size × 2.8, eased every frame; a dot marks the running ones. Click
// focuses a running app (a little squeeze) or launches it (two bounces);
// right click closes its windows. Each icon has a faint mirror image on the
// dock surface below it.
Item {
    id: root

    property real mouseX: -1            // in row coordinates, -1 = away
    // icons still easing back after the mouse left
    property bool settling: false
    onMouseXChanged: settling = true
    readonly property real range: Theme.size * 2.8
    // the area icons can grow into, for the dock input mask
    readonly property Item hit: hitArea

    implicitWidth: row.width
    implicitHeight: Theme.size

    Item {
        id: hitArea
        width: row.width
        height: Theme.size * Ui.magnify
        anchors.bottom: parent.bottom
    }

    HoverHandler {
        id: hover
        target: hitArea
        onPointChanged: root.mouseX = hovered ? point.position.x : -1
        onHoveredChanged: if (!hovered) root.mouseX = -1
    }

    // ease every icon scale towards its target, every frame while the mouse
    // is over the row or the icons are still easing back
    FrameAnimation {
        running: root.mouseX >= 0 || root.settling
        onTriggered: {
            let moving = false;
            for (let i = 0; i < apps.count; i++) {
                const item = apps.itemAt(i);
                if (!item)
                    continue;
                let target = 1;
                if (root.mouseX >= 0) {
                    const d = Math.abs(root.mouseX - (item.x + item.width / 2));
                    if (d < root.range)
                        target = 1 + (Ui.magnify - 1) * Math.pow(Math.cos(d / root.range * Math.PI / 2), 2);
                }
                if (item.s === target)
                    continue;
                let s = item.s + (target - item.s) * 0.2;
                if (Math.abs(target - s) < 0.002)
                    s = target;
                else
                    moving = true;
                item.s = s;
            }
            if (root.mouseX < 0 && !moving)
                root.settling = false;
        }
    }

    Row {
        id: row
        anchors.bottom: parent.bottom
        spacing: 6

        Repeater {
            id: apps
            model: Apps.list

            delegate: Item {
                id: app

                required property var modelData
                property real s: 1
                readonly property bool running: modelData.windows.length > 0

                width: Theme.size * s
                height: Theme.size * s
                anchors.bottom: parent.bottom

                Item {
                    id: icon
                    anchors.fill: parent
                    transform: [
                        Translate { id: bounce },
                        Scale { id: squeeze; origin.x: icon.width / 2; origin.y: icon.height / 2 }
                    ]

                    Image {
                        id: image
                        anchors.fill: parent
                        source: Apps.iconOf(app.modelData)
                        sourceSize: Qt.size(Theme.size * 2.2 * 2, Theme.size * 2.2 * 2)
                        smooth: true
                        mipmap: true
                        visible: false
                    }
                    // drop-shadow(0 5px 8px rgba(0, 0, 0, .35))
                    MultiEffect {
                        anchors.fill: image
                        source: image
                        shadowEnabled: true
                        shadowColor: Theme.iconShadow
                        shadowVerticalOffset: Theme.iconShadowY
                        shadowBlur: 0.5
                        blurMax: 16
                    }
                }

                // .refl: the icon mirrored on the dock surface, pad-b tall, at
                // --refl opacity, fading out 45% of the icon height down
                Item {
                    y: parent.height
                    width: parent.width
                    height: Theme.padBottom
                    clip: true
                    opacity: Theme.reflection

                    Item {
                        id: mirror
                        width: parent.width
                        height: app.height
                        visible: false
                        Image {
                            anchors.fill: parent
                            source: image.source
                            sourceSize: image.sourceSize
                            smooth: true
                            transform: Scale { yScale: -1; origin.y: app.height / 2 }
                        }
                    }
                    Rectangle {
                        id: fade
                        width: parent.width
                        height: app.height
                        visible: false
                        gradient: Gradient {
                            GradientStop { position: 0; color: "black" }
                            GradientStop { position: 0.45; color: "transparent" }
                        }
                    }
                    GE.OpacityMask {
                        width: parent.width
                        height: app.height
                        source: mirror
                        maskSource: fade
                    }
                }

                // launching: two bounces (translateY -38% at 40%, -8% at 70%)
                SequentialAnimation {
                    id: launchAnim
                    loops: 2
                    NumberAnimation { target: bounce; property: "y"; to: -0.38 * app.height; duration: 248; easing.type: Easing.Bezier; easing.bezierCurve: [0.3, 0.7, 0.4, 1, 1, 1] }
                    NumberAnimation { target: bounce; property: "y"; to: -0.08 * app.height; duration: 186; easing.type: Easing.Bezier; easing.bezierCurve: [0.3, 0.7, 0.4, 1, 1, 1] }
                    NumberAnimation { target: bounce; property: "y"; to: 0; duration: 186; easing.type: Easing.Bezier; easing.bezierCurve: [0.3, 0.7, 0.4, 1, 1, 1] }
                }
                // focusing: a quick squeeze to .88
                SequentialAnimation {
                    id: focusAnim
                    NumberAnimation { target: squeeze; properties: "xScale,yScale"; to: 0.88; duration: 150; easing.type: Easing.OutQuad }
                    NumberAnimation { target: squeeze; properties: "xScale,yScale"; to: 1; duration: 150; easing.type: Easing.OutQuad }
                }

                // running indicator, pad-b / 2 - 2px under the icon
                Rectangle {
                    x: (parent.width - 4) / 2
                    y: parent.height + Theme.padBottom / 2 - 2
                    width: 4
                    height: 4
                    radius: 2
                    color: Theme.dot
                    opacity: app.running ? 1 : 0
                    scale: app.running ? 1 : 0
                    Behavior on opacity { NumberAnimation { duration: 300 } }
                    Behavior on scale { NumberAnimation { duration: 300 } }
                    layer.enabled: true
                    layer.effect: MultiEffect {
                        shadowEnabled: true
                        shadowColor: Theme.dot
                        shadowBlur: 0.6
                        shadowHorizontalOffset: 0
                        shadowVerticalOffset: 0
                    }
                }

                Tip {
                    target: app
                    text: Apps.nameOf(app.modelData)
                    shown: area.containsMouse
                }

                MouseArea {
                    id: area
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    acceptedButtons: Qt.LeftButton | Qt.RightButton
                    onClicked: mouse => {
                        Ui.closePopover();
                        if (mouse.button === Qt.RightButton) {
                            Apps.close(app.modelData);
                        } else if (Apps.launch(app.modelData)) {
                            launchAnim.restart();
                        } else {
                            focusAnim.restart();
                        }
                    }
                }
            }
        }
    }
}
