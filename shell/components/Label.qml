import QtQuick
import ".."

// Text at any CSS pixel size. Qt rounds font sizes to whole pixels, so the
// prototype 11.5px / 12.5px / 10.5px text would come out a size off; a
// fractional size is drawn at twice the size and scaled down by half.
Item {
    id: root

    property alias text: label.text
    property alias color: label.color
    property alias elide: label.elide
    property alias horizontalAlignment: label.horizontalAlignment
    property real size: 13
    property int weight: Font.Medium
    property bool tnum: false               // font-variant-numeric: tabular-nums
    property real letterSpacing: 0          // px
    property bool uppercase: false
    property string family: Theme.font
    property bool shadow: false             // dock text: Theme.textShadow 1px below
    property real lineHeight: size * 1.2    // the prototype body line-height

    readonly property real k: Number.isInteger(size) ? 1 : 0.5
    readonly property real contentWidth: label.contentWidth * k

    implicitWidth: label.implicitWidth * k
    implicitHeight: lineHeight

    Text {
        id: label
        width: root.width / root.k
        scale: root.k
        transformOrigin: Item.TopLeft
        y: (root.height - height * root.k) / 2
        style: root.shadow ? Text.Raised : Text.Normal
        styleColor: Theme.textShadow
        lineHeightMode: Text.FixedHeight
        lineHeight: root.lineHeight / root.k
        verticalAlignment: Text.AlignVCenter
        font {
            family: root.family
            pixelSize: root.size / root.k
            weight: root.weight
            letterSpacing: root.letterSpacing / root.k
            capitalization: root.uppercase ? Font.AllUppercase : Font.MixedCase
            features: root.tnum ? Theme.tnum : ({})
        }
    }
}
