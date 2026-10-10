pragma Singleton
import QtQuick
import Quickshell
import Quickshell.Services.Notifications
import ".."

// The notification server (in place of mako): popups for the dock's
// Notifications window (prototype: components/notifications). Apps get
// bodies, images, actions and markup. config.notifications.rules restyle
// some (matched as substrings on appName / summary / body): `title`, `app`,
// `icon` (an icon name or path), `style` ("love"), `timeout` (ms, 0 = until
// closed). At most 4 popups.
Singleton {
    id: root

    // [{ id, notif, appName, summary, style, timeout }], oldest first
    property var popups: []
    property int nextId: 1

    function ruleFor(n) {
        const fields = { appName: n.appName, summary: n.summary, body: n.body };
        return Config.notificationRules.find(r => Object.entries(r.match ?? {})
            .every(([k, v]) => String(fields[k] ?? "").toLowerCase().includes(String(v).toLowerCase()))) ?? null;
    }
    function timeoutOf(n, rule) {
        if (rule?.timeout !== undefined)
            return rule.timeout;
        if (n.expireTimeout > 0)
            return n.expireTimeout;
        return n.urgency === NotificationUrgency.Critical ? 0 : n.urgency === NotificationUrgency.Low ? 3000 : 5000;
    }
    // bring the sender's window forward (its workspace, then the window): the
    // first client whose class contains the app's name (a rule's `app`, e.g.
    // WhatsApp), its own app name or its desktop entry
    function focusApp(p) {
        const names = [p.appName, p.notif.appName, p.notif.desktopEntry].filter(s => s).map(s => s.toLowerCase());
        Quickshell.execDetached(["sh", "-c",
            'addr=$(hyprctl clients -j | jq -r --argjson names "$1" \'first(.[] | select(.class | ascii_downcase | . as $c | any($names[]; . as $n | $c | contains($n)))) | .address\'); '
            + '[ -n "$addr" ] && [ "$addr" != null ] && hyprctl dispatch focuswindow "address:$addr" >/dev/null',
            "sh", JSON.stringify(names)]);
    }
    function dismiss(id) {
        const p = popups.find(x => x.id === id);
        popups = popups.filter(x => x.id !== id);
        p?.notif?.dismiss();
    }
    // a popup that timed out leaves the screen, the notification stays valid
    function hide(id) {
        popups = popups.filter(x => x.id !== id);
    }

    NotificationServer {
        keepOnReload: false
        bodySupported: true
        bodyMarkupSupported: true
        bodyHyperlinksSupported: true
        imageSupported: true
        actionsSupported: true
        persistenceSupported: true

        onNotification: n => {
            n.tracked = true;
            const rule = root.ruleFor(n);
            const p = {
                id: root.nextId++, notif: n,
                appName: rule?.app ?? n.appName, summary: rule?.title ?? n.summary, icon: rule?.icon ?? "",
                style: rule?.style ?? "", timeout: root.timeoutOf(n, rule),
                critical: n.urgency === NotificationUrgency.Critical
            };
            root.popups = root.popups.concat([p]).slice(-4);
            n.closed.connect(() => root.hide(p.id));
        }
    }
}
