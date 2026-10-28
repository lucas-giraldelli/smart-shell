import QtQuick
import Quickshell
import "../services"
import ".."
import "ui"
import "../lib/prs.mjs" as PrRules

// The PR tile popover (prototype: components/prs): one collapsible group
// per repo, like the docker pane; a row is the state icon and the title,
// and opens the PR in the default browser. The + in the head opens a field
// for the link of someone else's PR to follow (Enter follows it, Esc
// cancels; red while the link is not a PR); a followed PR gets an x to
// unfollow it.
Popover {
    id: root
    name: "prs"

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
    // which repos are open: the user choice (saved, so it outlives the dock
    // being rebuilt), else open when one needs action
    function isOpen(repo, status) {
        return Ui.prsExpanded[repo] ?? ["failing", "conflict", "behind"].includes(status);
    }

    // hidden repos leave the list, unless the user asks to see them
    property bool showHidden: false
    readonly property var visiblePrs: Prs.list.filter(p => showHidden || !Ui.prsHidden.includes(p.repo))
    function toggleHidden(repo) {
        Ui.prsHidden = Ui.prsHidden.includes(repo) ? Ui.prsHidden.filter(r => r !== repo) : Ui.prsHidden.concat([repo]);
    }

    bubbleWidth: 440
    padding: 6
    keyboard: true

    // the follow field
    property bool adding: false
    readonly property bool linkBad: field.text.trim() !== "" && !PrRules.prUrl(field.text)
    function follow() {
        if (!Prs.follow(field.text))
            return;
        field.text = "";
        adding = false;
    }
    onAddingChanged: if (adding) field.forceActiveFocus()
    onOpenChanged: if (!open) { adding = false; field.text = ""; }

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
                    id: addButton
                    implicitWidth: 26
                    implicitHeight: 26
                    flat: true
                    icon: root.adding ? "x" : "plus"
                    iconSize: 14
                    onClicked: root.adding = !root.adding
                    Tip {
                        target: addButton
                        text: I18n.t(root.adding ? "prs.cancel" : "prs.follow")
                        shown: addButton.hovered
                    }
                }
                IconButton {
                    implicitWidth: 26
                    implicitHeight: 26
                    flat: true
                    icon: "refresh-cw"
                    iconSize: 14
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

        // the link of the PR to follow
        Item {
            visible: root.adding
            width: parent.width
            height: visible ? 30 + 2 + (root.linkBad ? 18 : 0) + 6 : 0
            Rectangle {
                x: 8
                y: 2
                width: parent.width - 16
                height: 30
                radius: 8
                color: Theme.menuSurface
                border.color: root.linkBad ? Theme.crit : field.activeFocus ? Theme.menuAccent : Theme.menuStrong
                TextInput {
                    id: field
                    x: 9
                    width: parent.width - 18
                    anchors.verticalCenter: parent.verticalCenter
                    color: Theme.menuText
                    selectionColor: Theme.menuAccent
                    font { family: Theme.font; pixelSize: 12; weight: Font.Medium }
                    clip: true
                    Keys.onReturnPressed: root.follow()
                    Keys.onEnterPressed: root.follow()
                    Keys.onEscapePressed: event => {
                        root.adding = false;
                        field.text = "";
                        event.accepted = true;
                    }
                }
                Label {
                    x: 9
                    anchors.verticalCenter: parent.verticalCenter
                    visible: field.text === ""
                    text: "https://github.com/owner/repo/pull/123"
                    size: 12
                    color: Theme.menuFaint
                }
            }
            Label {
                visible: root.linkBad
                x: 10
                y: 2 + 30 + 3
                size: 11
                color: Theme.crit
                text: I18n.t("prs.invalid")
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
                        onClicked: Ui.prsExpanded = Object.assign({}, Ui.prsExpanded, { [group.modelData.repo]: !group.open })
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

                            // .row.pr: the state icon and the title
                            delegate: Rectangle {
                                id: pr

                                required property var modelData
                                readonly property string status: PrRules.prStatus(modelData)
                                // merged: dismissed; followed: unfollowed
                                readonly property bool removable: modelData.merged || (modelData.followed ?? false)
                                property bool copied: false

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
                                    width: parent.width - x - (pr.removable ? 64 : 38)
                                    anchors.verticalCenter: parent.verticalCenter
                                    elide: Text.ElideRight
                                    size: 12.5
                                    color: Theme.menuText
                                    text: pr.modelData.title
                                }
                                Tip {
                                    target: pr
                                    text: `#${pr.modelData.number}${pr.modelData.author ? " · @" + pr.modelData.author : ""} · ${I18n.t("prs.status." + pr.status)}`
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
                                // copies the link (on hover); a check for 1.5 s after
                                IconButton {
                                    opacity: prHover.hovered || pr.copied ? 1 : 0
                                    anchors.right: parent.right
                                    anchors.rightMargin: pr.removable ? 30 : 4
                                    anchors.verticalCenter: parent.verticalCenter
                                    implicitWidth: 24
                                    implicitHeight: 24
                                    radius: 6
                                    flat: true
                                    icon: pr.copied ? "check" : "copy"
                                    iconSize: 14
                                    onClicked: {
                                        Quickshell.clipboardText = pr.modelData.url;
                                        pr.copied = true;
                                        copiedTimer.restart();
                                    }
                                    Timer {
                                        id: copiedTimer
                                        interval: 1500
                                        onTriggered: pr.copied = false
                                    }
                                }
                                // merged is the past: dismiss it from the list;
                                // a followed one: unfollow it
                                IconButton {
                                    id: removeButton
                                    visible: pr.removable
                                    anchors.right: parent.right
                                    anchors.rightMargin: 4
                                    anchors.verticalCenter: parent.verticalCenter
                                    implicitWidth: 24
                                    implicitHeight: 24
                                    radius: 6
                                    flat: true
                                    icon: "x"
                                    iconSize: 14
                                    onClicked: pr.modelData.merged ? Prs.dismiss(pr.modelData.url) : Prs.unfollow(pr.modelData.url)
                                    Tip {
                                        target: removeButton
                                        text: I18n.t(pr.modelData.merged ? "prs.dismiss" : "prs.unfollow")
                                        shown: removeButton.hovered
                                    }
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
