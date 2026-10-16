pragma Singleton
import QtQuick
import Quickshell
import Quickshell.Io
import ".."
import "../lib/prs.mjs" as PrRules

// The open pull requests of the user, from any repo (`gh api graphql`, with the
// login of the gh CLI), and the ones of other people the user follows (their
// links in Ui.prsFollowed). Read every hour or on refresh. A PR that leaves
// the open list was merged or closed: merged ones raise a notification and
// stay listed (saved) until the user dismisses them; closed ones just go.
Singleton {
    id: root

    property var open: []               // [{ repo, number, title, url, created, checks, mergeState, review, merged }]
    property var followed: []           // the same, plus { followed: true, author }
    readonly property var list: open.concat(followed.filter(f => !open.some(p => p.url === f.url)), Ui.prsMerged)
    function dismiss(url) {
        Ui.prsMerged = Ui.prsMerged.filter(p => p.url !== url);
    }
    property bool loading: false
    property bool loaded: false
    property date updatedAt: new Date(0)

    // the user's PRs, then one `resource` per followed link (f0, f1...): the
    // links only ever come through PrRules.prUrl, so they are safe to inline
    readonly property string fields: 'fragment P on PullRequest { number title url createdAt state mergeStateStatus reviewDecision author { login } repository { nameWithOwner } commits(last: 1) { nodes { commit { statusCheckRollup { contexts(first: 100) { nodes { ... on CheckRun { status conclusion } ... on StatusContext { state } } } } } } } }'
    function query() {
        const follows = Ui.prsFollowed.map((url, i) => `f${i}: resource(url: "${url}") { ...P }`).join(" ");
        return `query { search(query: "is:pr is:open author:@me archived:false", type: ISSUE, first: 50) { nodes { ...P } } ${follows} } ${fields}`;
    }
    function toPr(n) {
        return {
            repo: n.repository.nameWithOwner, number: n.number, title: n.title, url: n.url, created: n.createdAt,
            checks: PrRules.checksOf(n.commits.nodes[0]?.commit.statusCheckRollup?.contexts.nodes),
            mergeState: n.mergeStateStatus, review: n.reviewDecision, merged: false
        };
    }

    // follow someone else's PR by its link; false when it is not a PR link
    function follow(text) {
        const url = PrRules.prUrl(text);
        if (!url)
            return false;
        if (!Ui.prsFollowed.includes(url))
            Ui.prsFollowed = Ui.prsFollowed.concat([url]);
        again = fetch.running;
        refresh();
        return true;
    }
    function unfollow(url) {
        Ui.prsFollowed = Ui.prsFollowed.filter(u => u !== url);
        followed = followed.filter(p => p.url !== url);
    }
    // a follow made while a read runs: read once more after it
    property bool again: false

    function refresh() {
        if (fetch.running)
            return;
        loading = true;
        fetch.command = ["gh", "api", "graphql", "-f", "query=" + query()];
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
        stdout: StdioCollector {
            onStreamFinished: {
                root.loading = false;
                let data;
                try {
                    data = JSON.parse(text).data;
                } catch (e) {
                    return;     // offline or not logged in: keep the last list
                }
                if (!data?.search)
                    return;
                const open = data.search.nodes.filter(n => n.number).map(n => root.toPr(n));
                root.readFollowed(data);
                const gone = root.loaded ? root.open.filter(p => !open.some(o => o.url === p.url)) : [];
                root.open = open;
                root.updatedAt = new Date();
                root.loaded = true;
                for (const p of gone)
                    check.createObject(root, { pr: p });
            }
        }
        onExited: {
            root.loading = false;
            if (root.again) {
                root.again = false;
                root.refresh();
            }
        }
    }

    // the followed PRs: open ones are listed; a merged one moves to the
    // merged list (a notification) and a closed one is dropped, both unfollowed;
    // one GitHub does not answer for (gone, no access) stays followed, unlisted
    function readFollowed(data) {
        const urls = Ui.prsFollowed;
        const list = [];
        const done = [];
        for (let i = 0; i < urls.length; i++) {
            const n = data[`f${i}`];
            if (!n?.number)
                continue;
            const pr = Object.assign(toPr(n), { followed: true, author: n.author?.login ?? "" });
            if (n.state === "OPEN") {
                list.push(pr);
                continue;
            }
            done.push(urls[i]);
            if (n.state === "MERGED" && !Ui.prsMerged.some(p => p.url === pr.url)) {
                Ui.prsMerged = Ui.prsMerged.concat([Object.assign(pr, { merged: true })]);
                Quickshell.execDetached(["notify-send", "-a", "smart-shell", "-i", "git-merge", "PR merged", `${pr.repo}#${pr.number} ${pr.title}`]);
            }
        }
        followed = list;
        if (done.length)
            Ui.prsFollowed = Ui.prsFollowed.filter(u => !done.includes(u));
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
