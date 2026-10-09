import QtQuick
import Quickshell
import ".."
import "ui"

// A tray item's menu (DBusMenu) in a popover, drawn with the prototype's menu
// rows (components/ui/ui.css; the prototype itself only shows the tray icons).
// Submenus open in place, with a back row on top.
Popover {
    id: root

    property var handle: null       // the item's QsMenuHandle
    property var stack: []          // entries of the open submenus, outermost first

    name: "tray"
    bubbleWidth: 240
    onHandleChanged: stack = []
    onOpenChanged: if (!open) stack = []

    QsMenuOpener {
        id: opener
        menu: root.stack.length ? root.stack[root.stack.length - 1] : root.handle
    }

    Column {
        width: parent.width

        MenuRow {
            visible: root.stack.length > 0
            icon: "chevron-left"
            title: root.stack.length ? root.label(root.stack[root.stack.length - 1].text) : ""
            onClicked: root.stack = root.stack.slice(0, -1)
        }
        Rectangle {
            visible: root.stack.length > 0
            x: 6
            width: parent.width - 12
            height: 1
            color: Theme.menuHover
        }

        Repeater {
            model: opener.children

            delegate: Item {
                id: entry

                required property var modelData

                width: parent.width
                height: modelData.isSeparator ? 9 : row.height

                // .menu-sep: 1px, margin 4px 6px
                Rectangle {
                    visible: entry.modelData.isSeparator
                    x: 6
                    y: 4
                    width: parent.width - 12
                    height: 1
                    color: Theme.menuHover
                }

                MenuRow {
                    id: row
                    visible: !entry.modelData.isSeparator
                    width: parent.width
                    title: root.label(entry.modelData.text)
                    enabled: entry.modelData.enabled
                    active: entry.modelData.checkState === Qt.Checked
                    iconSource: entry.modelData.icon

                    Check {
                        visible: entry.modelData.buttonType === QsMenuButtonType.CheckBox
                        on: entry.modelData.checkState === Qt.Checked
                    }
                    Radio {
                        visible: entry.modelData.buttonType === QsMenuButtonType.RadioButton
                        on: entry.modelData.checkState === Qt.Checked
                    }
                    Icon {
                        visible: entry.modelData.hasChildren
                        name: "chevron-right"
                        size: 16
                        color: Theme.menuSub
                    }

                    onClicked: {
                        if (entry.modelData.hasChildren) {
                            root.stack = [...root.stack, entry.modelData];
                        } else {
                            entry.modelData.triggered();
                            Ui.closePopover();
                        }
                    }
                }
            }
        }
    }

    // DBusMenu labels mark mnemonics with "_" ("__" is a literal underscore)
    function label(text) {
        return (text ?? "").replace(/__/g, "\u0000").replace(/_/g, "").replace(/\u0000/g, "_");
    }
}
