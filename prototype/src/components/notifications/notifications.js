import { Component, define } from '../../core/component.js';
import { icon, appIcon } from '../../core/icons.js';
import { setHTML } from '../ui/ui.js';
import { t, formatTime } from '../../i18n/index.js';
import { update } from '../../state.js';
import { config } from '../../data/config.js';

// Notification popups (the shell is the notification server - Quickshell's
// NotificationServer - in place of mako). They stack above the dock's right
// end, newest at the bottom, in the dock's glass: the sender's picture (or
// the app's icon) with the app's icon as a badge, the app and time, the title,
// the message in up to 2 lines and the actions. A click runs the default
// action (opens the chat); hover holds the timer. config.notifications.rules
// restyle some (match on app / summary): a title, an app name, an icon, a `love`
// look, a timeout.
const timeoutOf = n => n.timeout ?? (n.urgency === 'critical' ? 0 : n.urgency === 'low' ? 3000 : 5000);

export function ruleFor(n, rules = config.notifications?.rules ?? []) {
  return rules.find(r => Object.entries(r.match ?? {}).every(([k, v]) => String(n[k] ?? '').toLowerCase().includes(String(v).toLowerCase()))) ?? null;
}

const timers = new Map();
function arm(n) {
  clearTimeout(timers.get(n.id));
  const ms = timeoutOf(n);
  if (ms > 0) timers.set(n.id, setTimeout(() => dismiss(n.id), ms));
}
export function dismiss(id) {
  clearTimeout(timers.get(id));
  timers.delete(id);
  update('notifications', s => ({ list: s.list.filter(n => n.id !== id) }));
}
let nextId = 1;
export function notify(n) {
  const rule = ruleFor(n);
  const full = { id: nextId++, time: new Date(), urgency: 'normal', actions: [], ...n, ...(rule ? { style: rule.style, timeout: rule.timeout, summary: rule.title ?? n.summary, appName: rule.app ?? n.appName, appIcon: rule.icon ?? n.appIcon } : {}) };
  update('notifications', s => ({ list: [...s.list, full].slice(-4) }));
  arm(full);
}

class Notifications extends Component {
  static slices = ['notifications'];

  setup() {
    this.classList.add('notifs');
    this.addEventListener('click', e => {
      const card = e.target.closest('[data-id]');
      if (!card) return;
      const id = +card.dataset.id;
      // close, an action, or the card itself (the default action)
      if (e.target.closest('[data-close]')) return dismiss(id);
      dismiss(id);
    });
    this.addEventListener('pointerenter', e => {
      const card = e.target.closest?.('[data-id]');
      if (card) clearTimeout(timers.get(+card.dataset.id));
    }, true);
    this.addEventListener('pointerleave', e => {
      const card = e.target.closest?.('[data-id]');
      if (card) { const n = this.list.find(x => x.id === +card.dataset.id); if (n) arm(n); }
    }, true);
  }

  update({ notifications: s }) {
    this.list = s.list;
    setHTML(this, s.list.map(n => `
      <div class="notif${n.style ? ' ' + n.style : ''}${n.urgency === 'critical' ? ' critical' : ''}" data-id="${n.id}">
        <div class="nf-pic">
          ${n.image ? `<img class="nf-img" src="${n.image}" alt="">` : n.appIcon ? `<img class="nf-app" src="${appIcon(n.appIcon)}" alt="">` : `<span class="nf-bell">${icon('bell')}</span>`}
          ${n.image ? `<img class="nf-badge" src="${appIcon(n.appIcon)}" alt="">` : ''}
        </div>
        <div class="nf-text">
          <div class="nf-head"><span class="nf-appname">${n.appName}</span><span class="nf-time">${formatTime(n.time)}</span>
            <button class="nf-close" data-close title="${t('notifications.close')}">${icon('x')}</button></div>
          <div class="nf-summary">${n.style === 'love' ? `${icon('heart', 'nf-heart')}` : ''}${n.summary}</div>
          ${n.body ? `<div class="nf-body">${n.body}</div>` : ''}
          ${n.actions.length ? `<div class="nf-actions">${n.actions.map(a => `<button class="btn-s">${a}</button>`).join('')}</div>` : ''}
        </div>
      </div>`).join(''));
  }
}
define('ss-notifications', Notifications);

// sample senders for the dev panel: a picture is just their initials
const avatar = (initials, a, b) => 'data:image/svg+xml,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="40" height="40" fill="url(#g)"/><text x="20" y="25.5" font-family="Inter,sans-serif" font-size="15" font-weight="600" fill="#fff" text-anchor="middle">${initials}</text></svg>`);
export const samples = {
  whatsapp: { appName: 'WhatsApp', appIcon: 'whatsapp', image: avatar('MS', '#22c55e', '#0ea5e9'), summary: 'Marina Souza', body: 'Chego aí umas 19h, quer que eu leve alguma coisa pro jantar?', actions: [] },
  slack: { appName: 'Slack', appIcon: 'slack', image: avatar('RA', '#a855f7', '#ec4899'), summary: 'Rafael Alves · #frontend', body: 'pode dar uma olhada no PR do checkout quando tiver um tempinho? a pipeline passou', actions: ['Responder'] },
  claude: { appName: 'Claude Code', appIcon: 'kitty', summary: 'Claude Code', body: 'Claude is waiting for your input' },
  love: { appName: 'Chromium', appIcon: 'whatsapp', image: avatar('♥', '#be123c', '#7f1d1d'), summary: 'Amor', body: 'te amo, volta logo ❤️' },
  critical: { appName: 'smart-shell', summary: 'Bateria do fone em 5%', body: 'Kuba Mali 2', urgency: 'critical' },
};
