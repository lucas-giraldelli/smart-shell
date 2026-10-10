pragma Singleton
import QtQuick
import Quickshell
import Quickshell.Io

// The user's open pull requests, from any repo (`gh api graphql`, with the
// gh CLI's own login). Read every 20 minutes or on refresh. A PR that leaves
// the open list was merged or closed: merged ones stay listed until the next
// read and raise a notification.
Singleton {
    id: root

    property var list: []               // [{ repo, number, title, url, checks, mergeState, review, merged }]
    property bool loading: false
    property bool loaded: false
    property date updatedAt: new Date(0)

    readonly property string query: 'query { search(query: "is:pr is:open author:@me archived:false", type: ISSUE, first: 50) { nodes { ... on PullRequest { number title url mergeStateStatus reviewDecision repository { nameWithOwner } commits(last: 1) { nodes { commit { statusCheckRollup { state } } } } } } } }'

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
        interval: 20 * 60 * 1000
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
                    repo: n.repository.nameWithOwner, number: n.number, title: n.title, url: n.url,
                    checks: n.commits.nodes[0]?.commit.statusCheckRollup?.state ?? null,
                    mergeState: n.mergeStateStatus, review: n.reviewDecision, merged: false
                }));
                const gone = root.loaded ? root.list.filter(p => !p.merged && !open.some(o => o.url === p.url)) : [];
                root.list = open;
                root.updatedAt = new Date();
                root.loaded = true;
                for (const p of gone)
                    check.createObject(root, { pr: p });
            }
        }
        onExited: root.loading = false
    }

    // a PR that left the open list: merged (listed until the next read, and
    // a notification) or just closed (dropped)
    Component {
        id: check
        Process {
            property var pr
            running: true
            command: ["gh", "pr", "view", pr.url, "--json", "state", "-q", ".state"]
            stdout: StdioCollector {
                onStreamFinished: {
                    if (text.trim() === "MERGED") {
                        root.list = root.list.concat([Object.assign({}, pr, { merged: true })]);
                        Quickshell.execDetached(["notify-send", "-a", "smart-shell", "-i", "git-merge", "PR merged", `${pr.repo}#${pr.number} ${pr.title}`]);
                    }
                }
            }
            onExited: destroy()
        }
    }
}
