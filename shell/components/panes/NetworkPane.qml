import QtQuick
import "../.."
import "../../services"
import "../ui"
import ".."
import "../../lib/rules.mjs" as Rules

// Network tab (prototype: control-center/panes/network.js): connection
// status, addresses, live traffic and VPN.
PaneScroll {
    id: root

    property bool copied: false

    // .status: padding 6px 8px 10px, gap 10
    Item {
        width: parent.width
        height: 6 + 36 + 10
        readonly property color tint: Network.online ? Theme.ok : Theme.crit

        Rectangle {
            id: big
            x: 8
            y: 6
            width: 36
            height: 36
            radius: 11
            color: Theme.mix(parent.tint, 0.15)
            Icon {
                anchors.centerIn: parent
                name: "network"
                size: 18
                color: big.parent.tint
            }
        }
        Column {
            x: 54
            anchors.verticalCenter: big.verticalCenter
            width: parent.width - x - 8
            Label {
                text: I18n.t(Network.online ? "network.connected" : "network.offline")
                size: 13
                weight: Font.Bold
                lineHeight: 16
                color: Theme.menuText
            }
            Label {
                width: parent.width
                elide: Text.ElideRight
                text: `${Network.kind} · ${Network.speed}`
                size: 11
                color: Theme.menuSub
            }
        }
    }

    // .card: a dl in two columns, gap 6px 14px, padding 10px 12px, 12px
    Rectangle {
        x: 8
        width: parent.width - 16
        height: card.height + 20
        radius: 11
        color: Theme.menuSurface

        Grid {
            id: card
            x: 12
            y: 10
            columns: 2
            rowSpacing: 6
            columnSpacing: 14
            readonly property real valueWidth: parent.width - 24 - 14 - Math.max(ipLabel.implicitWidth, gwLabel.implicitWidth, dnLabel.implicitWidth)

            Label { id: ipLabel; size: 12; color: Theme.menuSub; text: I18n.t("network.ip") }
            Label { width: card.valueWidth; horizontalAlignment: Text.AlignRight; size: 12; tnum: true; color: Theme.menuText; text: Network.ip }
            Label { id: gwLabel; size: 12; color: Theme.menuSub; text: I18n.t("network.gateway") }
            Label { width: card.valueWidth; horizontalAlignment: Text.AlignRight; size: 12; tnum: true; color: Theme.menuText; text: Network.gateway }
            Label { id: dnLabel; size: 12; color: Theme.menuSub; text: I18n.t("network.dockerNet") }
            Label { width: card.valueWidth; horizontalAlignment: Text.AlignRight; size: 12; tnum: true; color: Theme.menuText; text: Network.dockerNet }
        }
    }

    // .traffic: two cards, gap 6, margin 8px 8px 0
    Item {
        width: parent.width
        height: 8 + 73.2
        Row {
            x: 8
            y: 8
            spacing: 6
            Repeater {
                model: [
                    { key: "down", icon: "arrow-down", color: Theme.menuAccent },
                    { key: "up", icon: "arrow-up", color: Theme.upload }
                ]
                Rectangle {
                    id: traffic
                    required property var modelData
                    readonly property var values: Network[modelData.key]
                    width: (404 - 16 - 6) / 2
                    height: 73.2
                    radius: 10
                    color: Theme.menuSurface

                    Row {
                        x: 10
                        y: 8
                        spacing: 3      // the space between icon and text
                        Icon {
                            anchors.verticalCenter: parent.verticalCenter
                            name: traffic.modelData.icon
                            size: 12
                            color: Theme.menuSub
                        }
                        Label {
                            size: 11
                            color: Theme.menuSub
                            text: I18n.t(traffic.modelData.key === "down" ? "network.download" : "network.upload")
                        }
                    }
                    Label {
                        x: 10
                        y: 8 + 13.2 + 2
                        size: 15
                        lineHeight: 18
                        weight: Font.Bold
                        tnum: true
                        color: Theme.menuText
                        text: Rules.fmtRate(traffic.values[traffic.values.length - 1])
                    }
                    Sparkline {
                        x: 10
                        y: 8 + 13.2 + 2 + 18 + 4
                        width: parent.width - 20
                        height: 20
                        values: traffic.values
                        color: traffic.modelData.color
                    }
                }
            }
        }
    }

    Section { text: I18n.t("network.connections") }
    // VPN: openvpn3 or NetworkManager; the switch follows the session
    MenuRow {
        icon: Network.vpnOn ? "shield-check" : "shield"
        title: Network.vpn ? `${I18n.t("network.vpn")} · ${Network.vpn}` : I18n.t("network.vpn")
        meta: !Network.vpn ? "—"
            : I18n.t(`network.vpnStates.${Network.vpnState}`, { server: Network.vpnServer || Network.vpn })
        metaColor: Network.vpnOn ? Theme.ok : Network.vpnBusy ? Theme.warn : Network.vpnState === "error" ? Theme.crit : Theme.menuSub
        enabled: Network.vpn !== ""
        onClicked: Network.toggleVpn()
        Switch { on: Network.vpnOn || Network.vpnBusy }
    }
    // several profiles: pick one (saved as vpn.profile)
    Column {
        id: profiles
        visible: Network.vpnProfiles.length > 1
        property bool open: false
        width: parent.width
        MenuRow {
            icon: "chevron-right"
            title: I18n.t("network.profile")
            meta: Network.vpn
            onClicked: profiles.open = !profiles.open
        }
        Repeater {
            model: profiles.open ? Network.vpnProfiles : []
            MenuRow {
                id: profileRow
                required property var modelData
                title: modelData.name
                meta: modelData.source === "openvpn3" ? "openvpn3" : "NetworkManager"
                active: modelData.name === Network.vpn
                onClicked: {
                    Network.setVpnProfile(modelData.name);
                    profiles.open = false;
                }
                Radio { on: profileRow.active }
            }
        }
    }
    MenuRow {
        icon: "copy"
        title: I18n.t("network.copyIp")
        onClicked: {
            Network.copyIp();
            root.copied = true;
            copiedTimer.restart();
        }
        Label {
            size: 11
            color: Theme.menuSub
            text: root.copied ? I18n.t("common.copied") : ""
        }
    }

    Timer {
        id: copiedTimer
        interval: 1500
        onTriggered: root.copied = false
    }
}
