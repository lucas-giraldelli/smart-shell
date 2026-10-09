import QtQuick
import QtQuick.Effects
import QtQuick.Shapes
import "../services"
import ".."

// Now playing (prototype: components/music): cover tile, title, artist ·
// player, progress and a little equaliser that dances while playing. Click
// toggles play/pause. Hidden while no MPRIS player is around.
Tile {
    id: root

    readonly property bool shown: Media.active

    implicitWidth: 212

    Tip {
        text: I18n.t("music.hint")
        shown: root.hovered
    }

    MouseArea {
        anchors.fill: parent
        cursorShape: Qt.PointingHandCursor
        onClicked: {
            Ui.closePopover();
            Media.toggle();
        }
    }

    Row {
        x: 6
        anchors.verticalCenter: parent.verticalCenter
        spacing: 9

        // .art: size - 12, radius 9, a conic gradient, shadow 0 4px 10px
        Item {
            anchors.verticalCenter: parent.verticalCenter
            width: Theme.size - 12
            height: width

            RectangularShadow {
                anchors.fill: parent
                offset.y: 4
                blur: 10
                radius: 9
                color: Qt.rgba(0, 0, 0, 0.3)
            }
            Shape {
                anchors.fill: parent
                preferredRendererType: Shape.CurveRenderer
                ShapePath {
                    strokeWidth: -1
                    // conic-gradient(from 210deg, #ff3d7f, #7c3aed, #2563eb, #ff3d7f)
                    fillGradient: ConicalGradient {
                        centerX: (Theme.size - 12) / 2
                        centerY: (Theme.size - 12) / 2
                        angle: 240
                        GradientStop { position: 0; color: "#ff3d7f" }
                        GradientStop { position: 1 / 3; color: "#2563eb" }
                        GradientStop { position: 2 / 3; color: "#7c3aed" }
                        GradientStop { position: 1; color: "#ff3d7f" }
                    }
                    PathRectangle {
                        width: Theme.size - 12
                        height: Theme.size - 12
                        radius: 9
                    }
                }
            }
            Icon {
                anchors.centerIn: parent
                name: "music"
                size: 18
                color: Theme.labelText
            }
        }

        Column {
            anchors.verticalCenter: parent.verticalCenter
            width: 212 - 2 - 6 - (Theme.size - 12) - 9 - 9 - eq.width - 11

            Label {
                width: parent.width
                text: Media.title
                elide: Text.ElideRight
                size: 12.5
                weight: Font.DemiBold
                shadow: true
                color: Theme.text
            }
            Label {
                width: parent.width
                text: [Media.artist, Media.source].filter(Boolean).join(" · ")
                elide: Text.ElideRight
                size: 11
                shadow: true
                color: Theme.sub
            }
            // .progress: margin-top 5, 3px
            Item { width: 1; height: 5 }
            Rectangle {
                width: parent.width
                height: 3
                radius: 2
                color: Theme.ringTrack
                clip: true
                Rectangle {
                    width: parent.width * Media.progress
                    height: parent.height
                    color: Theme.accent
                }
            }
        }

        // .eq: four 3px bars, 14px tall; they bounce while playing
        Row {
            id: eq
            anchors.verticalCenter: parent.verticalCenter
            height: 14
            spacing: 2

            Repeater {
                model: [900, 600, 1100, 750]
                Rectangle {
                    id: bar
                    required property int modelData
                    property real level: 0.3
                    anchors.bottom: parent.bottom
                    width: 3
                    height: 14 * level
                    radius: 2
                    color: Theme.accent

                    SequentialAnimation on level {
                        running: Media.playing
                        loops: Animation.Infinite
                        NumberAnimation { from: 0.15; to: 1; duration: bar.modelData; easing.type: Easing.InOutQuad }
                        NumberAnimation { from: 1; to: 0.15; duration: bar.modelData; easing.type: Easing.InOutQuad }
                        onRunningChanged: if (!running) bar.level = 0.3
                    }
                }
            }
        }
    }
}
