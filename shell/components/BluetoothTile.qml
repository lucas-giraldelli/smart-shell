import QtQuick
import Quickshell
import Quickshell.Bluetooth
import Quickshell.Io
import "../services"
import ".."
import "ui"
import "../lib/rules.mjs" as Rules

// Bluetooth (prototype: components/bluetooth). Click toggles the adapter;
// right-click opens the device menu (like blueman). The tile is just the icon
// (crossed out when off) and only grows - with an animation - to name the
// headset while one is connecting or connected. BlueZ via Quickshell.Bluetooth.
Tile {
    id: root

    readonly property var adapter: Bluetooth.defaultAdapter
    readonly property bool available: Caps.bluetooth && adapter !== null
    readonly property bool on: available && adapter.enabled
    readonly property var devices: adapter ? adapter.devices.values.filter(d => d.paired) : []
    readonly property var connected: devices.find(d => d.connected) ?? null
    readonly property var connecting: devices.find(d => d.state === BluetoothDeviceState.Connecting) ?? null
    readonly property var device: connected ?? connecting
    readonly property bool expanded: device !== null

    // keep the last name while collapsing, so the text does not vanish mid-animation
    property string name: ""
    property string sub: ""
    onDeviceChanged: update()
    Connections {
        target: root.device
        ignoreUnknownSignals: true
        function onBatteryChanged() { root.update(); }
        function onStateChanged() { root.update(); }
    }
    function update() {
        if (!device)
            return;
        name = device.name;
        const battery = batteryOf(device);
        sub = device === connecting ? I18n.t("bluetooth.connecting")
            : battery >= 0 ? I18n.t("bluetooth.headset", { battery })
            : I18n.t("bluetooth.headsetOutput");
    }

    // battery in %, or -1. Many TWS headsets (e.g. Kuba Mali 2) never expose
    // org.bluez.Battery1, but answer AT commands on their Serial Port channel:
    // `bluetooth_battery` (python-bluetooth-battery) reads that, once a minute.
    property int sppBattery: -1
    onConnectedChanged: sppBattery = -1
    onSppBatteryChanged: update()
    function batteryOf(d) {
        if (d.batteryAvailable)
            return Math.round(d.battery * 100);
        return d === connected ? sppBattery : -1;
    }
    Timer {
        running: root.connected !== null && !root.connected.batteryAvailable
        repeat: true
        triggeredOnStart: true
        interval: 60000
        onTriggered: {
            spp.command = ["bluetooth_battery", root.connected.address];
            spp.running = true;
        }
    }
    Process {
        id: spp
        stdout: StdioCollector {
            onStreamFinished: {
                const m = text.match(/(\d+)%/);
                if (m)
                    root.sppBattery = Number(m[1]);
            }
        }
    }

    // BlueZ refuses to power on an adapter under a soft rfkill block (seen after
    // a logout), so powering on lifts the block first. BlueZ takes a moment to
    // see the change, hence the retries.
    property var connectAfterPower: null
    function toggle() {
        if (on) {
            powerRetry.stop();
            adapter.enabled = false;
        } else {
            powerOn(null);
        }
    }
    function powerOn(device) {
        connectAfterPower = device;
        powerRetry.tries = 0;
        unblock.running = true;
    }
    Process {
        id: unblock
        command: ["rfkill", "unblock", "bluetooth"]
        onExited: powerRetry.restart()
    }
    Timer {
        id: powerRetry
        property int tries: 0
        interval: 250
        repeat: true
        triggeredOnStart: true
        onTriggered: {
            if (!root.adapter || tries >= 8) {
                stop();
            } else if (root.adapter.enabled) {
                stop();
                if (root.connectAfterPower)
                    root.connectAfterPower.connect();
            } else {
                tries++;
                root.adapter.enabled = true;
            }
        }
    }

    // icon only (padding 0 15px), or padding 0 14px 0 13px + gap 9 + the name
    implicitWidth: 2 + (expanded ? 13 + 20 + 9 + body.width + 14 : 15 + 20 + 15)
    Behavior on implicitWidth { NumberAnimation { duration: 450; easing.type: Easing.Bezier; easing.bezierCurve: [0.3, 1.15, 0.5, 1, 1, 1] } }
    open: menu.open

    Tip {
        target: root
        text: root.available ? I18n.t(root.on ? "bluetooth.turnOff" : "bluetooth.turnOn")
            : Rules.missingText(Panes.i18n, "bluetooth")
        shown: root.hovered
    }

    MouseArea {
        anchors.fill: parent
        enabled: root.available
        cursorShape: Qt.PointingHandCursor
        acceptedButtons: Qt.LeftButton | Qt.RightButton
        onClicked: mouse => {
            if (mouse.button === Qt.RightButton) {
                menu.open ? Ui.closePopover() : Ui.openPopover("bluetooth");
            } else {
                Ui.closePopover();
                root.toggle();
            }
        }
    }

    Icon {
        id: icon
        x: root.expanded ? 14 : 16
        anchors.verticalCenter: parent.verticalCenter
        Behavior on x { NumberAnimation { duration: 350 } }
        name: !root.on ? "bluetooth-off" : root.connected ? "bluetooth-connected" : "bluetooth"
        size: 20
        shadow: true
        color: root.on ? Theme.accent : Theme.sub
        Behavior on color { ColorAnimation { duration: 300 } }

        // connecting: the icon pulses until the headset answers
        SequentialAnimation {
            running: root.connecting !== null
            loops: Animation.Infinite
            onRunningChanged: if (!running) { icon.opacity = 1; icon.scale = 1; }
            ParallelAnimation {
                NumberAnimation { target: icon; property: "opacity"; to: 0.35; duration: 500; easing.type: Easing.InOutQuad }
                NumberAnimation { target: icon; property: "scale"; to: 0.88; duration: 500; easing.type: Easing.InOutQuad }
            }
            ParallelAnimation {
                NumberAnimation { target: icon; property: "opacity"; to: 1; duration: 500; easing.type: Easing.InOutQuad }
                NumberAnimation { target: icon; property: "scale"; to: 1; duration: 500; easing.type: Easing.InOutQuad }
            }
        }
    }

    // .bt-body: up to 120px, fades and slides in
    Column {
        id: body
        x: 1 + 13 + 20 + 9 + (root.expanded ? 0 : -6)
        anchors.verticalCenter: parent.verticalCenter
        width: Math.min(120, Math.max(nameLabel.implicitWidth, subLabel.implicitWidth))
        // clipped by the growing tile, like max-width + overflow: hidden
        visible: opacity > 0 && root.width > 2 + 13 + 20 + 9 + 4
        opacity: root.expanded ? 1 : 0
        Behavior on opacity { NumberAnimation { duration: 250 } }
        Behavior on x { NumberAnimation { duration: 350 } }

        Label {
            id: nameLabel
            width: parent.width
            elide: Text.ElideRight
            text: root.name
            size: 12.5
            weight: Font.DemiBold
            shadow: true
            color: Theme.text
        }
        Label {
            id: subLabel
            width: parent.width
            elide: Text.ElideRight
            text: root.sub
            size: 11
            shadow: true
            color: Theme.sub
        }
    }

    // the device menu (prototype: the .menu built in bluetooth.js)
    Popover {
        id: menu
        owner: root
        name: "bluetooth"

        Column {
            width: parent.width

            MenuRow {
                icon: "bluetooth"
                title: "Bluetooth"
                onClicked: root.toggle()
                Switch { on: root.on }
            }
            Separator {}
            // margin-top 6, collapsing with the separator 4
            Section { gap: 2; text: I18n.t("bluetooth.paired") }
            Repeater {
                model: root.devices
                MenuRow {
                    id: deviceRow
                    required property var modelData
                    readonly property bool busy: modelData.state === BluetoothDeviceState.Connecting
                    icon: "headphones"
                    title: modelData.name
                    active: modelData.connected
                    meta: busy ? I18n.t("bluetooth.connecting")
                        : modelData.connected ? (root.batteryOf(modelData) >= 0 ? I18n.t("bluetooth.connected", { battery: root.batteryOf(modelData) }) : I18n.t("common.on"))
                        : I18n.t("bluetooth.disconnected")
                    onClicked: {
                        if (busy)
                            return;
                        if (modelData.connected) {
                            modelData.disconnect();
                        } else if (root.on) {
                            modelData.connect();
                        } else {
                            // connecting powers the adapter on, like blueman does
                            root.powerOn(modelData);
                        }
                    }
                    Label {
                        visible: !deviceRow.busy
                        text: I18n.t(deviceRow.modelData.connected ? "bluetooth.disconnect" : "bluetooth.connect")
                        size: 11
                        color: Theme.menuAccent
                    }
                }
            }
            Separator {}
            MenuRow {
                title: I18n.t("bluetooth.manager")
                onClicked: {
                    Quickshell.execDetached(["blueman-manager"]);
                    Ui.closePopover();
                }
            }
        }
    }

    // .menu-sep: 1px, margin 4px 6px
    component Separator: Item {
        width: parent.width
        height: 9
        Rectangle {
            x: 6
            y: 4
            width: parent.width - 12
            height: 1
            color: Theme.menuHover
        }
    }
}
