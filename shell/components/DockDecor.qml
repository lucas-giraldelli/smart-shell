import QtQuick
import QtQuick.Effects
import QtQuick.Shapes
import ".."

// The decorations some themes put on the dock (prototype: styles/themes/*.css):
// aqua's 3D glass shelf under the icons, halloween's cobweb in the corner and
// snowy's cap of snow resting on top, with a lump spilling over each corner.
// Fill the dock with it; it draws behind (shelf) or around (web, snow) it.
Item {
    id: root

    // aqua: a 56px plane tilted back 52deg (perspective 320px, from its bottom
    // edge), 22px wider than the dock on each side
    Shape {
        id: shelf
        visible: Theme.shelf
        z: -1
        readonly property real depth: 56 * Math.sin(52 * Math.PI / 180)
        readonly property real k: 320 / (320 + depth)          // the far edge's scale
        readonly property real h: 56 * Math.cos(52 * Math.PI / 180) * k
        readonly property real w: root.width + 44
        x: -22
        y: root.height + 2 - h
        width: w
        height: h
        preferredRendererType: Shape.CurveRenderer

        RectangularShadow {
            z: -1
            anchors.fill: parent
            anchors.topMargin: parent.h * 0.3
            offset.y: 16
            blur: 30
            color: Qt.rgba(0, 0, 0, 0.45)
        }
        ShapePath {
            strokeColor: Qt.rgba(1, 1, 1, 0.85)
            strokeWidth: 1
            fillGradient: LinearGradient {
                x1: 0; y1: 0; x2: 0; y2: shelf.h
                GradientStop { position: 0; color: Qt.rgba(230 / 255, 240 / 255, 1, 0.55) }
                GradientStop { position: 0.7; color: Qt.rgba(150 / 255, 175 / 255, 210 / 255, 0.45) }
                GradientStop { position: 1; color: Qt.rgba(240 / 255, 248 / 255, 1, 0.7) }
            }
            startX: shelf.w * (1 - shelf.k) / 2; startY: 0
            PathLine { x: shelf.w * (1 + shelf.k) / 2; y: 0 }
            PathLine { x: shelf.w; y: shelf.h }
            PathLine { x: 0; y: shelf.h }
            PathLine { x: shelf.w * (1 - shelf.k) / 2; y: 0 }
        }
        // the bright front edge: 0 2px 0 rgba(255, 255, 255, .95)
        Rectangle {
            y: shelf.h
            width: shelf.w
            height: 2
            color: Qt.rgba(1, 1, 1, 0.95)
        }
    }

    // halloween: a cobweb in the top-left corner
    Image {
        visible: Theme.cobweb
        x: -2
        y: -2
        z: 3
        width: 46
        height: 46
        opacity: 0.55
        sourceSize: Qt.size(92, 92)
        source: "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 46" fill="none" stroke="#fff" stroke-width=".8"><path d="M2 2 L44 10 M2 2 L30 30 M2 2 L10 44"/><path d="M14 4.5 Q12 12 6 14 M26 7 Q22 22 7 26 M38 9 Q32 32 9 38"/></svg>')
    }

    // snowy: a row of snow lumps on top, thinning out at both ends
    Item {
        visible: Theme.snowCap
        z: 3
        anchors.fill: parent

        Canvas {
            id: cap
            x: 4
            y: -16
            width: root.width - 8
            height: 15
            onWidthChanged: requestPaint()
            onPaint: {
                const ctx = getContext("2d");
                ctx.reset();
                const lump = (cx, cy, r, color) => {
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(cx, cy, r, 0, Math.PI * 2);
                    ctx.fill();
                };
                for (let x = 0; x < width + 31; x += 31)
                    lump(x + 13, 13, 10, "#ffffff");
                for (let x = 15; x < width + 23; x += 23)
                    lump(x + 7, 13, 7, "#f4f9ff");
                // mask: transparent -> opaque over 34px at each end
                ctx.globalCompositeOperation = "destination-in";
                const g = ctx.createLinearGradient(0, 0, width, 0);
                const edge = Math.min(0.5, 34 / width);
                g.addColorStop(0, "rgba(0,0,0,0)");
                g.addColorStop(edge, "rgba(0,0,0,1)");
                g.addColorStop(1 - edge, "rgba(0,0,0,1)");
                g.addColorStop(1, "rgba(0,0,0,0)");
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, width, height);
            }
            layer.enabled: true
            layer.effect: MultiEffect {
                shadowEnabled: true
                shadowColor: Qt.rgba(80 / 255, 120 / 255, 180 / 255, 0.45)
                shadowVerticalOffset: 2
                shadowBlur: 0.15
            }
        }

        // the lumps spilling over the rounded corners
        Repeater {
            model: [-1, 1]
            Canvas {
                required property int modelData
                width: 26
                height: 20
                x: modelData < 0 ? -4 : root.width + 4 - width
                y: -9
                rotation: modelData * 28
                transform: Scale { origin.x: 13; xScale: modelData }
                onPaint: {
                    const ctx = getContext("2d");
                    ctx.reset();
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.ellipse(13 - 11, 8 - 8, 22, 16);
                    ctx.fill();
                    ctx.fillStyle = "#f4f9ff";
                    ctx.beginPath();
                    ctx.arc(7.8, 18.4, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
                layer.enabled: true
                layer.effect: MultiEffect {
                    shadowEnabled: true
                    shadowColor: Qt.rgba(80 / 255, 120 / 255, 180 / 255, 0.45)
                    shadowVerticalOffset: 2
                    shadowBlur: 0.15
                }
            }
        }
    }
}
