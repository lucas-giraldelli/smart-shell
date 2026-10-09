import QtQuick
import "../.."
import ".."
import "../../lib/rules.mjs" as Rules

// A tab whose backend is missing says what to install instead of showing its
// controls (prototype: missing() in control-center.js, .cc .missing).
Item {
    id: root

    required property var pane
    readonly property string hint: Rules.installHint(pane.requires) ?? ""

    Column {
        x: 16
        y: 8 + 26
        width: parent.width - 32
        spacing: 6

        Icon {
            anchors.horizontalCenter: parent.horizontalCenter
            name: root.pane.icon
            size: 26
            color: Theme.menuFaint
        }
        Item { width: 1; height: 4 - 6 + 6 }
        Label {
            anchors.horizontalCenter: parent.horizontalCenter
            text: Rules.missingText(Panes.i18n, root.pane.requires)
            size: 13
            weight: Font.Bold
            color: Theme.menuText
        }
        Text {
            visible: root.hint !== ""
            width: parent.width
            horizontalAlignment: Text.AlignHCenter
            wrapMode: Text.Wrap
            textFormat: Text.StyledText
            color: Theme.menuSub
            font { family: Theme.font; pixelSize: 11; weight: Font.Medium }
            text: I18n.t("capabilities.install", { pkg: `<font face="${Theme.mono}" color="${Theme.menuText}">${root.hint}</font>` })
        }
    }
}
