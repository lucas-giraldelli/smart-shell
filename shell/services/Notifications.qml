pragma Singleton
import QtQuick
import Quickshell
import Quickshell.Services.Notifications
import ".."

// The notification server (in place of mako): popups for the dock's
// Notifications window (prototype: components/notifications). Apps get
// bodies, images, actions and markup. config.notifications.rules restyle
// some (matched as substrings on appName / summary / body): `title`, `app`,
// `style` ("love"), `timeout` (ms, 0 = until closed). At most 4 popups.
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
                appName: rule?.app ?? n.appName, summary: rule?.title ?? n.summary,
                style: rule?.style ?? "", timeout: root.timeoutOf(n, rule),
                critical: n.urgency === NotificationUrgency.Critical
            };
            root.popups = root.popups.concat([p]).slice(-4);
            n.closed.connect(() => root.hide(p.id));
        }
    }
}
