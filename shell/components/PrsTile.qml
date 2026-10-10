import QtQuick
import "../services"
import ".."
import "../lib/prs.mjs" as PrRules

// The user's open pull requests (prototype: components/prs): the PR icon in
// the worst state's colour and how many are open. Click lists them by repo.
// Hidden until the first read.
Tile {
    id: root

    readonly property bool shown: Prs.loaded
    readonly property int count: Prs.list.filter(p => !p.merged).length
    readonly property string worst: PrRules.worst(Prs.list) ?? ""

    // padding 0 11px (+ border), the 22px icon, gap 8, the count
    implicitWidth: 1 + 11 + 22 + 8 + num.implicitWidth + 11 + 1
    open: list.open

    Tip {
        target: root
        text: I18n.t("prs.tile", { n: root.count })
        shown: root.hovered && !list.open
    }

    MouseArea {
        anchors.fill: parent
        cursorShape: Qt.PointingHandCursor
        onClicked: list.open ? Ui.closePopover() : Ui.openPopover("prs")
    }

    Icon {
        x: 12
        anchors.verticalCenter: parent.verticalCenter
        name: "git-pull-request"
        size: 22
        shadow: true
        color: list.colorOf(root.worst)
    }
    Label {
        id: num
        x: 42
        anchors.verticalCenter: parent.verticalCenter
        text: root.count
        size: 18
        weight: Font.DemiBold
        tnum: true
        shadow: true
        color: Theme.text
    }

    PrList {
        id: list
        owner: root
    }
}
