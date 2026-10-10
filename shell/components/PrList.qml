import QtQuick
import Quickshell
import "../services"
import ".."
import "ui"
import "../lib/prs.mjs" as PrRules

// The PR tile's popover (prototype: components/prs): one collapsible group
// per repo, like the docker pane; a row is the state's icon and the title,
// and opens the PR in the default browser.
Popover {
    id: root

    // state -> icon / colour (prototype: LOOK in prs.js)
    readonly property var looks: ({
        failing: { icon: "circle-x", color: Theme.crit },
        conflict: { icon: "circle-x", color: Theme.crit },
        behind: { icon: "triangle-alert", color: Theme.warn },
        pending: { icon: "circle-dashed", color: Theme.menuSub },
        green: { icon: "check", color: Theme.ok },
        approved: { icon: "check-check", color: Theme.ok },
        merged: { icon: "git-merge", color: "#a78bfa" }
    })
    function colorOf(status) {
        return looks[status]?.color ?? Theme.menuSub;
    }
    // which repos are open: the user's choice, else open when one needs action
    property var expanded: ({})
    function isOpen(repo, status) {
        return expanded[repo] ?? ["failing", "conflict", "behind"].includes(status);
    }

    // hidden repos leave the list, unless the user asks to see them
    property bool showHidden: false
    readonly property var visiblePrs: Prs.list.filter(p => showHidden || !Ui.prsHidden.includes(p.repo))
    function toggleHidden(repo) {
        Ui.prsHidden = Ui.prsHidden.includes(repo) ? Ui.prsHidden.filter(r => r !== repo) : Ui.prsHidden.concat([repo]);
    }

    name: "prs"
    bubbleWidth: 440
    padding: 6

    Column {
        width: parent.width

        // .prs-head: the section title, when it was read, refresh
        Item {
            width: parent.width
            height: 32
            Label {
                x: 8
                anchors.verticalCenter: parent.verticalCenter
                text: I18n.t("prs.title").toUpperCase()
                size: 10.5
                weight: Font.DemiBold
                letterSpacing: 0.84
                color: Theme.menuFaint
            }
            Row {
                anchors.right: parent.right
                anchors.verticalCenter: parent.verticalCenter
                spacing: 8
                Label {
                    anchors.verticalCenter: parent.verticalCenter
                    size: 11
                    color: Theme.menuSub
                    text: I18n.t("prs.updated", { time: Qt.formatTime(Prs.updatedAt, "HH:mm") })
                }
                IconButton {
                    icon: "refresh-cw"
                    onClicked: Prs.refresh()
                    RotationAnimation on rotation {
                        running: Prs.loading
                        from: 0
                        to: 360
                        duration: 800
                        loops: Animation.Infinite
                        onRunningChanged: if (!running) parent.rotation = 0
                    }
                }
            }
        }

        Item {
            visible: root.visiblePrs.length === 0
            width: parent.width
            height: 32
            Label {
                x: 8
                anchors.verticalCenter: parent.verticalCenter
                size: 11
                color: Theme.menuSub
                text: I18n.t("prs.none")
            }
        }

        Repeater {
            model: PrRules.byRepo(root.visiblePrs)

            delegate: Column {
                id: group

                required property var modelData
                readonly property string status: PrRules.worst(modelData.prs)
                readonly property bool open: root.isOpen(modelData.repo, status)
                readonly property bool hiddenRepo: Ui.prsHidden.includes(modelData.repo)

                width: parent.width
                opacity: hiddenRepo ? 0.5 : 1

                // .pr-repo: padding 8px, gap 10, 12.5px semibold
                Rectangle {
                    width: parent.width
                    height: 8 + 15 + 8
                    radius: 9
                    color: repoHover.hovered ? Theme.menuSurface : "transparent"

                    HoverHandler { id: repoHover }

                    Row {
                        x: 8
                        anchors.verticalCenter: parent.verticalCenter
                        spacing: 10
                        Icon {
                            anchors.verticalCenter: parent.verticalCenter
                            name: "chevron-right"
                            size: 14
                            color: Theme.menuSub
                            rotation: group.open ? 90 : 0
                            Behavior on rotation { NumberAnimation { duration: 250; easing.type: Easing.Bezier; easing.bezierCurve: Theme.ease } }
                        }
                        Label {
                            anchors.verticalCenter: parent.verticalCenter
                            size: 12.5
                            weight: Font.DemiBold
                            color: Theme.menuText
                            text: group.modelData.repo.split("/")[1]
                        }
                    }
                    MouseArea {
                        anchors.fill: parent
                        cursorShape: Qt.PointingHandCursor
                        onClicked: root.expanded = Object.assign({}, root.expanded, { [group.modelData.repo]: !group.open })
                    }
                    Row {
                        anchors.right: parent.right
                        anchors.rightMargin: 8
                        anchors.verticalCenter: parent.verticalCenter
                        spacing: 8
                        // the eye shows on hover (always on a hidden repo)
                        Rectangle {
                            anchors.verticalCenter: parent.verticalCenter
                            width: 22
                            height: 22
                            radius: 6
                            opacity: repoHover.hovered || group.hiddenRepo ? 1 : 0
                            color: eyeArea.containsMouse ? Theme.menuStrong : "transparent"
                            Icon {
                                anchors.centerIn: parent
                                name: group.hiddenRepo ? "eye" : "eye-off"
                                size: 14
                                color: Theme.menuSub
                            }
                            MouseArea {
                                id: eyeArea
                                anchors.fill: parent
                                hoverEnabled: true
                                cursorShape: Qt.PointingHandCursor
                                onClicked: root.toggleHidden(group.modelData.repo)
                            }
                            Tip {
                                target: parent
                                text: I18n.t(group.hiddenRepo ? "prs.unhide" : "prs.hide")
                                shown: eyeArea.containsMouse
                            }
                        }
                        Label {
                            anchors.verticalCenter: parent.verticalCenter
                            width: Math.max(20, implicitWidth)
                            horizontalAlignment: Text.AlignRight
                            size: 11
                            tnum: true
                            color: Theme.menuSub
                            text: group.modelData.prs.length
                        }
                    }
                }

                // .pr-body: height animates open / shut, PRs indented 14px
                Item {
                    width: parent.width
                    height: group.open ? body.height : 0
                    clip: true
                    Behavior on height { NumberAnimation { duration: 250; easing.type: Easing.Bezier; easing.bezierCurve: Theme.ease } }

                    Column {
                        id: body
                        x: 14
                        width: parent.width - 14
                        Repeater {
                            model: group.modelData.prs

                            // .row.pr: the state's icon and the title
                            delegate: Rectangle {
                                id: pr

                                required property var modelData
                                readonly property string status: PrRules.prStatus(modelData)

                                width: body.width
                                height: 32
                                radius: 9
                                color: prHover.hovered ? Theme.menuHover : "transparent"

                                HoverHandler { id: prHover }

                                Icon {
                                    x: 8
                                    anchors.verticalCenter: parent.verticalCenter
                                    name: root.looks[pr.status].icon
                                    size: 16
                                    color: root.looks[pr.status].color
                                }
                                Label {
                                    x: 34
                                    width: parent.width - x - (pr.modelData.merged ? 38 : 8)
                                    anchors.verticalCenter: parent.verticalCenter
                                    elide: Text.ElideRight
                                    size: 12.5
                                    color: Theme.menuText
                                    text: pr.modelData.title
                                }
                                Tip {
                                    target: pr
                                    text: `#${pr.modelData.number} · ${I18n.t("prs.status." + pr.status)}`
                                    shown: prHover.hovered
                                }
                                MouseArea {
                                    anchors.fill: parent
                                    cursorShape: Qt.PointingHandCursor
                                    onClicked: {
                                        Qt.openUrlExternally(pr.modelData.url);
                                        Ui.closePopover();
                                    }
                                }
                                // merged is the past: dismiss it from the list
                                IconButton {
                                    visible: pr.modelData.merged
                                    anchors.right: parent.right
                                    anchors.rightMargin: 4
                                    anchors.verticalCenter: parent.verticalCenter
                                    implicitWidth: 24
                                    implicitHeight: 24
                                    radius: 6
                                    flat: true
                                    icon: "x"
                                    iconSize: 14
                                    onClicked: Prs.dismiss(pr.modelData.url)
                                }
                            }
                        }
                    }
                }
            }
        }
            // .pr-hidden-toggle: list the hidden repos too, or not
        Rectangle {
            visible: Ui.prsHidden.length > 0
            width: parent.width
            height: 30
            radius: 9
            color: toggleArea.containsMouse ? Theme.menuSurface : "transparent"
            Row {
                x: 8
                anchors.verticalCenter: parent.verticalCenter
                spacing: 8
                Icon {
                    anchors.verticalCenter: parent.verticalCenter
                    name: root.showHidden ? "eye-off" : "eye"
                    size: 13
                    color: Theme.menuSub
                }
                Label {
                    anchors.verticalCenter: parent.verticalCenter
                    size: 11
                    color: Theme.menuSub
                    text: I18n.t(root.showHidden ? "prs.hideHidden" : "prs.showHidden", { n: Ui.prsHidden.length })
                }
            }
            MouseArea {
                id: toggleArea
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: root.showHidden = !root.showHidden
            }
        }
    }
}
