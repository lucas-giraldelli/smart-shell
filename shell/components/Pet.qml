import QtQuick
import QtQuick.Effects
import QtQuick.Shapes
import "../services"
import ".."
import "../lib/pets.mjs" as Engine
import "../lib/rules.mjs" as Rules

// The pet walking on top of the dock (prototype: components/pets, one per
// dock, Ui.pet). It reacts to CPU load - sleeps, idles, walks or runs - and
// during a work meeting (an ongoing event in the "work" category) sits at a
// laptop and types, and while YouTube Music plays (config.pets.danceWith) it
// dances its species' dance. Hover shows its name, mood and the load; a click
// sends up a heart. Holds still while a fullscreen window is focused.
Item {
    id: root

    required property Item floor            // the dock: its top edge is the ground
    readonly property string kind: Pets.species[Ui.pet] ? Ui.pet : ""
    readonly property var species: Pets.species[kind] ?? null

    property var engine: null
    property var s: ({ x: 20, dir: 1, moving: false, fast: false, pose: "", jump: false, step: 0.42, mood: "stand" })
    property real clock: 0                  // seconds, drives the leg / blink / screen cycles

    // a work meeting wins over music, music over the CPU
    readonly property bool working: (Events.ongoing?.category ?? "") === "work"
    // config.thresholds: low free RAM makes it heavy, heat turns it reddish
    // (0 ok, 1 warn, 2 crit)
    function level(status) {
        return status === "crit" ? 2 : status === "warn" ? 1 : 0;
    }
    readonly property int heavy: level(Rules.memStatus(SystemStats, Config.thresholds))
    readonly property int hot: level(Rules.tempStatus(SystemStats, Config.thresholds))
    readonly property bool dancing: Media.dancing && !working
    readonly property var dance: Engine.DANCES[kind] ?? null
    // where in its dance loop the pet is (one beat = 0.5 s)
    readonly property real dancePhase: dance ? (clock % (0.5 * dance.beats)) / (0.5 * dance.beats) : 0
    readonly property var move: {
        if (!dancing || !dance || s.pose !== "dance")
            return {};
        // with cava, the moves get bigger with the music's loudness
        const m = dance.at(dancePhase), k = Beat.active ? 0.6 + 0.8 * Beat.level : 1;
        return { dx: (m.dx ?? 0) * k, dy: (m.dy ?? 0) * k, rot: (m.rot ?? 0) * k };
    }

    // music notes while dancing: bursts of 2-4 every 1.2-1.8 s (or on cava's
    // beats), staggered 120 ms, drifting up and sideways, gone in 1.5 s; at
    // most 8 at a time
    property var notes: []          // [{ born, dx, rot, size, color, glyph }]
    property var pending: []        // birth times of the notes still to come
    property real burstAt: 0
    readonly property var noteColors: [Theme.accent, "#ffffff", Qt.tint(Theme.accent, Qt.rgba(1, 1, 1, 0.4)), Qt.tint(Theme.accent, Qt.rgba(0.94, 0.67, 0.99, 0.3))]
    function burst() {
        const n = 2 + Math.floor(Math.random() * 3);
        pending = pending.concat(Array.from({ length: n }, (_, i) => clock + i * 0.12));
    }
    function tickNotes() {
        if (dancing && s.pose === "dance" && !Beat.active && clock >= burstAt) {
            burst();
            burstAt = clock + 1.2 + Math.random() * 0.6;
        }
        let live = notes.filter(n => clock - n.born < 1.5);
        const due = pending.filter(t => t <= clock);
        for (const t of due) {
            if (live.length >= 8)
                break;
            live.push({
                born: t, glyph: Math.random() < 0.5 ? "♪" : "♫",
                dx: (Math.random() * 2 - 1) * 12, rot: (Math.random() * 2 - 1) * 20, size: 10 + Math.random() * 4,
                color: noteColors[Math.floor(Math.random() * noteColors.length)]
            });
        }
        pending = pending.filter(t => t > clock);
        if (live.length !== notes.length || due.length)
            notes = live;
    }
    Connections {
        target: Beat
        function onBeat() {
            if (root.dancing && root.s.pose === "dance")
                root.burst();
        }
    }
    readonly property bool lying: s.pose.includes("lie")
    readonly property bool sleeping: s.pose.includes("sleep")

    visible: species !== null
    width: 46
    height: 36
    // bottom: calc(100% - 3px) of the dock
    y: floor.y - height + 3
    x: floor.x + s.x

    function hatch() {
        engine = species ? Engine.createPet(species, floor.width) : null;
    }
    onKindChanged: hatch()
    Component.onCompleted: hatch()

    FrameAnimation {
        running: root.engine !== null && !Ui.calm
        onTriggered: {
            const dt = Math.min(frameTime, 0.05);
            root.clock += dt;
            root.s = root.engine.step(dt, SystemStats.load, root.working ? "work" : root.dancing ? "dance" : null, root.floor.width,
                { cpu: Config.thresholds.cpu, heavy: root.heavy });
            root.tickNotes();
        }
    }

    // the look of this frame (pets.css, baked into SVGs by lib/pets.mjs)
    readonly property var lookOpts: {
        const t = clock, s = root.s;
        const phase = (t % s.step) / s.step;                         // legA / legB cadence
        const blink = (t % 4.5) / 4.5 > 0.94 && (t % 4.5) / 4.5 < 0.99;
        const tongue = s.pose === "tongue" && ((t % 1.1) / 1.1 > 0.55 && (t % 1.1) / 1.1 < 0.8);
        const croak = s.pose === "croak" ? 1 + 0.7 * (0.5 - 0.5 * Math.cos(t / 0.42 * Math.PI))
            : s.pose === "dance" && root.kind === "frog" ? 1 + 0.7 * (0.5 - 0.5 * Math.cos(t / 0.25 * Math.PI)) : 1;
        return {
            // walking legs follow the stride; dancing ones the beat
            leg: s.pose === "dance" ? ((t % 0.5) < 0.25 ? 1 : -1)
                : s.moving && !root.species?.hop ? (phase < 0.25 || phase >= 0.75 ? 1 : -1) : 0,
            lie: root.lying,
            closed: root.sleeping || blink,
            tongue,
            pouch: Math.round(croak * 10) / 10,
            bob: s.pose === "work" ? (Math.floor(t / 0.2) % 2 ? 0.7 : 0) : s.fast ? (Math.floor(t / (s.step / 2)) % 2 ? 1.6 : 0) : 0,
            screen: s.pose === "work" ? Engine.SCREEN_COLORS[Math.floor((t % 2.4) / 0.6) % 4] : ""
        };
    }

    Item {
        id: sprite
        width: 46
        height: 36
        // hop (frog, bunny) and jump lift the whole sprite; waddle (penguin) rocks it
        x: root.move.dx ?? 0
        y: {
            if (root.move.dy !== undefined)
                return root.move.dy;
            if (root.s.jump)
                return -16 * Math.sin(Math.min(1, (root.clock % 0.55) / 0.55) * Math.PI);
            if (root.species?.hop && root.s.moving)    // heavy: lower hops
                return -(root.heavy ? 4 : 8) * Math.abs(Math.sin(root.clock / (root.s.step * 1.3) * Math.PI));
            return 0;
        }
        rotation: root.move.rot !== undefined ? root.move.rot
            : root.species?.waddle && root.s.moving ? 7 * Math.sin(root.clock / root.s.step * Math.PI) : 0
        transformOrigin: Item.Bottom

        // heavy: squashed a little (scale 1.04 x .94 from its feet)
        transform: Scale { origin.x: 23; origin.y: 36; xScale: root.heavy ? 1.04 : 1; yScale: root.heavy ? 0.94 : 1 }

        Image {
            id: spriteImage
            anchors.fill: parent
            visible: root.hot === 0
            sourceSize: Qt.size(92, 72)
            smooth: true
            source: root.species ? Engine.look(root.species, root.lookOpts) : ""
            // faces right; flip around the sprite box when walking left
            transform: Scale { origin.x: 23; xScale: root.s.dir < 0 ? -1 : 1 }
        }
        // heat: reddish from warn, more at crit
        MultiEffect {
            visible: root.hot > 0
            anchors.fill: spriteImage
            source: spriteImage
            transform: Scale { origin.x: 23; xScale: root.s.dir < 0 ? -1 : 1 }
            colorization: root.hot === 2 ? 0.45 : 0.25
            colorizationColor: "#f97316"
        }
    }

    // sleeping: two z's drifting up (2.4 s, staggered)
    Repeater {
        model: [0, 1.2]
        Text {
            required property real modelData
            readonly property real p: ((root.clock + modelData) % 2.4) / 2.4
            visible: root.sleeping
            x: 30 + 10 * p
            y: -6 + 4 - 20 * p
            scale: 0.7 + 0.45 * p
            opacity: p < 0.3 ? p / 0.3 * 0.9 : 0.9 * (1 - (p - 0.3) / 0.7)
            text: "z"
            color: Theme.text
            font { family: Theme.font; pixelSize: 11; weight: Font.Bold }
        }
    }

    // the notes: rise 24px, drift sideways with a wobble, fade (pets.css .note)
    Repeater {
        model: root.notes
        Text {
            required property var modelData
            readonly property real p: Math.min(1, (root.clock - modelData.born) / 1.5)
            readonly property real e: 1 - Math.pow(1 - p, 2)         // ease-out
            x: 28 + modelData.dx * e + 3 * Math.sin(p * Math.PI)
            y: -2 + 4 - 28 * e
            rotation: modelData.rot * e
            scale: 0.7 + 0.35 * Math.min(1, p * 2)
            opacity: p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85
            text: modelData.glyph
            color: modelData.color
            style: Text.Raised
            styleColor: Qt.rgba(0, 0, 0, 0.35)
            font { family: Theme.font; pixelSize: Math.round(modelData.size); weight: Font.Bold }
        }
    }

    // critical free RAM: a sweat drop runs down (1.6 s)
    Rectangle {
        readonly property real p: (root.clock % 1.6) / 1.6
        visible: root.heavy === 2
        x: root.s.dir < 0 ? 46 - 33 - 4 : 33
        y: 4 + 10 * p * p
        width: 4
        height: 6
        radius: 2
        color: "#7dd3fc"
        opacity: p < 0.2 ? p / 0.2 * 0.9 : 0.9 * (1 - (p - 0.2) / 0.8)
    }
    // critical heat: waves rising above it (1.2 s)
    Shape {
        readonly property real p: (root.clock % 1.2) / 1.2
        visible: root.hot === 2
        x: 12
        y: -12 + 2 - 8 * p
        width: 22
        height: 12
        opacity: p < 0.4 ? p / 0.4 * 0.75 : 0.75 * (1 - (p - 0.4) / 0.6)
        preferredRendererType: Shape.CurveRenderer
        ShapePath {
            strokeColor: "#fb923c"
            strokeWidth: 1.2
            fillColor: "transparent"
            capStyle: ShapePath.RoundCap
            PathSvg { path: "M3 11 q2 -2 0 -4 q-2 -2 0 -4 M11 11 q2 -2 0 -4 q-2 -2 0 -4 M19 11 q2 -2 0 -4 q-2 -2 0 -4" }
        }
    }

    // hover: "Gato · Andando · CPU 23%"
    Tip {
        target: root
        shown: hover.hovered
        text: !root.species ? "" : I18n.t("pets.bubble", {
            name: I18n.t(`pets.names.${root.kind}`),
            mood: root.s.mood === "chill" ? I18n.t("pets.chill") : I18n.t(`pets.moods.${root.s.mood}`),
            load: Math.round(SystemStats.load)
        })
    }
    HoverHandler { id: hover }

    // click: a heart floats up
    Text {
        id: heart
        anchors.horizontalCenter: parent.horizontalCenter
        y: -4
        opacity: 0
        text: "♥"
        color: Theme.crit
        font.pixelSize: 16
        ParallelAnimation {
            id: love
            NumberAnimation { target: heart; property: "opacity"; from: 1; to: 0; duration: 1000; easing.type: Easing.OutQuad }
            NumberAnimation { target: heart; property: "y"; from: -4; to: -34; duration: 1000; easing.type: Easing.OutQuad }
            NumberAnimation { target: heart; property: "scale"; from: 0.6; to: 1.3; duration: 1000; easing.type: Easing.OutQuad }
        }
    }
    MouseArea {
        anchors.fill: parent
        cursorShape: Qt.PointingHandCursor
        onClicked: love.restart()
    }
}
