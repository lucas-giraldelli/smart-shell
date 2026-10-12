pragma Singleton
import QtQuick
import Quickshell
import Quickshell.Io
import ".."

// The open pull requests of the user, from any repo (`gh api graphql`, with the
// login of the gh CLI). Read every hour or on refresh. A PR that leaves
// the open list was merged or closed: merged ones raise a notification and
// stay listed (saved) until the user dismisses them; closed ones just go.
Singleton {
    id: root

    property var open: []               // [{ repo, number, title, url, created, checks, mergeState, review, merged }]
    readonly property var list: open.concat(Ui.prsMerged)
    function dismiss(url) {
        Ui.prsMerged = Ui.prsMerged.filter(p => p.url !== url);
    }
    property bool loading: false
    property bool loaded: false
    property date updatedAt: new Date(0)

    readonly property string query: 'query { search(query: "is:pr is:open author:@me archived:false", type: ISSUE, first: 50) { nodes { ... on PullRequest { number title url createdAt mergeStateStatus reviewDecision repository { nameWithOwner } commits(last: 1) { nodes { commit { statusCheckRollup { state } } } } } } } }'

    function refresh() {
        if (fetch.running)
            return;
        loading = true;
        fetch.running = true;
    }

    Timer {
        running: true
        repeat: true
        triggeredOnStart: true
        interval: 60 * 60 * 1000
        onTriggered: root.refresh()
    }

    Process {
        id: fetch
        command: ["gh", "api", "graphql", "-f", "query=" + root.query]
        stdout: StdioCollector {
            onStreamFinished: {
                root.loading = false;
                let nodes;
                try {
                    nodes = JSON.parse(text).data.search.nodes;
                } catch (e) {
                    return;     // offline or not logged in: keep the last list
                }
                const open = nodes.filter(n => n.number).map(n => ({
                    repo: n.repository.nameWithOwner, number: n.number, title: n.title, url: n.url, created: n.createdAt,
                    checks: n.commits.nodes[0]?.commit.statusCheckRollup?.state ?? null,
                    mergeState: n.mergeStateStatus, review: n.reviewDecision, merged: false
                }));
                const gone = root.loaded ? root.open.filter(p => !open.some(o => o.url === p.url)) : [];
                root.open = open;
                root.updatedAt = new Date();
                root.loaded = true;
                for (const p of gone)
                    check.createObject(root, { pr: p });
            }
        }
        onExited: root.loading = false
    }

    // a PR that left the open list: merged (a notification, listed until
    // dismissed) or just closed (dropped)
    Component {
        id: check
        Process {
            property var pr
            running: true
            command: ["gh", "pr", "view", pr.url, "--json", "state", "-q", ".state"]
            stdout: StdioCollector {
                onStreamFinished: {
                    if (text.trim() === "MERGED") {
                        if (!Ui.prsMerged.some(p => p.url === pr.url))
                            Ui.prsMerged = Ui.prsMerged.concat([Object.assign({}, pr, { merged: true })]);
                        Quickshell.execDetached(["notify-send", "-a", "smart-shell", "-i", "git-merge", "PR merged", `${pr.repo}#${pr.number} ${pr.title}`]);
                    }
                }
            }
            onExited: destroy()
        }
    }
}
