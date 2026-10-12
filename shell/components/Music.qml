import QtQuick
import QtQuick.Effects
import QtQuick.Shapes
import "../services"
import "ui"
import ".."

// Now playing (prototype: components/music): cover tile, title, artist ·
// player, progress and a little equaliser that dances while playing. Click
// toggles play/pause, right click opens the YouTube Music app volume;
// hovering shows the full title and artist.
// Hidden while no MPRIS player is around.
Tile {
    id: root

    readonly property bool shown: Media.active

    implicitWidth: 212
    open: volume.open

    // title and artist are cut short in the tile: the tooltip has them in full
    // (no player name: it is only ever "Chromium" / "Mozilla Zen")
    Tip {
        target: root
        text: [Media.title, Media.artist].filter(Boolean).join(" · ")
        shown: root.hovered
    }

    // click: play / pause; right click: the YouTube Music app volume
    MouseArea {
        anchors.fill: parent
        cursorShape: Qt.PointingHandCursor
        acceptedButtons: Qt.LeftButton | Qt.RightButton
        onClicked: mouse => {
            if (mouse.button === Qt.RightButton) {
                // YouTube Music: its volume and controls; any other player:
                // go to its window
                if (Media.showingMusicApp) {
                    volume.open ? Ui.closePopover() : Ui.openPopover("music-volume");
                } else {
                    Ui.closePopover();
                    Media.focusPlayer(Media.player);
                }
                return;
            }
            Ui.closePopover();
            Media.toggle();
        }
    }

    Popover {
        id: volume
        owner: root
        name: "music-volume"
        bubbleWidth: 240

        Column {
            width: parent.width
            Section { text: I18n.t("music.volume") }
            Slider {
                visible: Audio.musicApp !== null
                icon: Audio.musicMuted ? "volume-x" : "volume-2"
                button: true
                off: Audio.musicMuted
                label: "YouTube Music"
                value: Audio.musicApp ? Audio.appVolume(Audio.musicApp) : 0
                valueText: Audio.musicMuted ? I18n.t("common.muted") : `${value}%`
                onMoved: v => {
                    Audio.setMusicMuted(false);
                    Audio.setAppVolume(Audio.musicApp, v);
                }
                onButtonClicked: Audio.setMusicMuted(!Audio.musicMuted)
            }
            // previous / play-pause / next (MPRIS) and like (the app Shift + "+")
            Item {
                visible: Media.musicPlayer !== null
                width: parent.width
                height: 4 + 30 + 6
                Row {
                    x: 8
                    y: 4
                    spacing: 6
                    IconButton {
                        icon: "skip-back"
                        interactive: Media.musicPlayer?.canGoPrevious ?? false
                        opacity: interactive ? 1 : 0.45
                        onClicked: Media.musicPlayer.previous()
                    }
                    IconButton {
                        icon: Media.musicPlayer?.isPlaying ? "pause" : "play"
                        onClicked: Media.musicPlayer.togglePlaying()
                    }
                    IconButton {
                        icon: "skip-forward"
                        interactive: Media.musicPlayer?.canGoNext ?? false
                        opacity: interactive ? 1 : 0.45
                        onClicked: Media.musicPlayer.next()
                    }
                }
                IconButton {
                    id: like
                    anchors.right: parent.right
                    anchors.rightMargin: 8
                    y: 4
                    icon: Media.liked ? "heart-filled" : "heart"
                    // red when the app says it is liked; a short flash when it cannot tell
                    property bool flash: false
                    off: flash || Media.liked
                    onClicked: {
                        Media.likeMusic();
                        if (Media.likeStatus === "") {
                            flash = true;
                            flashTimer.restart();
                        }
                    }
                    Timer { id: flashTimer; interval: 600; onTriggered: like.flash = false }
                }
            }
            MenuRow {
                visible: Audio.musicApp === null
                enabled: false
                icon: "music"
                title: I18n.t("music.notPlaying")
            }
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
                visible: cover.status !== Image.Ready
                name: "music"
                size: 18
                color: Theme.labelText
            }

            // the track cover, when the player has one, rounded like the tile
            Image {
                id: cover
                anchors.fill: parent
                visible: false
                cache: false
                asynchronous: true
                fillMode: Image.PreserveAspectCrop
                sourceSize: Qt.size(width * 2, height * 2)
                source: Media.art ? `${Media.art}?${encodeURIComponent(Media.track)}` : ""
            }
            Rectangle {
                id: coverMask
                anchors.fill: parent
                radius: 9
                visible: false
                layer.enabled: true
            }
            MultiEffect {
                anchors.fill: parent
                visible: cover.status === Image.Ready
                source: cover
                maskEnabled: true
                maskSource: coverMask
                maskThresholdMin: 0.5
                maskSpreadAtMin: 1
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
                // the artist (or the album); the player only in the tooltip
                text: Media.artist || Media.album
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
                    // the position is read once a second: glide between reads
                    // (a seek or a new track jumps)
                    Behavior on width {
                        enabled: Media.playing
                        NumberAnimation { duration: 1000 }
                    }
                }
            }
        }

        // .eq: four 3px bars, 14px tall; with cava they follow the music
        // (bass to treble), without it they bounce while playing
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
                    required property int index
                    property real level: 0.3
                    anchors.bottom: parent.bottom
                    width: 3
                    height: 14 * (Beat.running ? Math.max(0.15, Beat.bars[index]) : level)
                    radius: 2
                    color: Theme.accent
                    Behavior on height {
                        enabled: Beat.running
                        NumberAnimation { duration: 70 }
                    }

                    SequentialAnimation on level {
                        running: Media.playing && !Beat.running && !Ui.calm
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
