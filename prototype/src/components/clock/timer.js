import { store, update } from '../../state.js';
import { savePref } from '../../core/prefs.js';
import { notify } from '../notifications/notifications.js';
import { t } from '../../i18n/index.js';

// The clock timer (shell: services/Countdown.qml): minutes, an optional name
// and a colour, started from the clock's right-click popover. The clock shows
// it on its second line in that colour until it ends; then a notification,
// and it's gone. The popover pauses / resumes or stops it. Saved ({ end,
// color, label, left }: `left` is the time left in ms while paused), so it
// survives a reload.

// light enough to tint the glass and stay readable as text on it
export const COLORS = ['#facc15', '#fb923c', '#f472b6', '#a78bfa', '#38bdf8', '#4ade80'];

const save = (timer, timerLast) => {
  savePref('timer', timer);
  if (timerLast) savePref('timerLast', timerLast);
  update('ui', timerLast ? { timer, timerLast } : { timer });
};
export function startTimer(minutes, color, label) {
  save({ end: Date.now() + minutes * 60000, color, label }, { minutes, color, label });
}
export const cancelTimer = () => save(null);
export const isPaused = timer => timer?.left != null;
// play / pause in one
export function toggleTimer() {
  const t = store.get().ui.timer;
  if (!t) return;
  const now = Date.now();
  save(isPaused(t) ? { ...t, end: now + t.left, left: null } : { ...t, left: Math.max(0, t.end - now) });
}

// "4:05" / "1:02:30"
export function remainingText(timer, now = Date.now()) {
  const s = Math.ceil((isPaused(timer) ? timer.left : Math.max(0, timer.end - now)) / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60);
  const pad = n => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
}

// once a second (the clock's tick): an ended timer notifies and goes
export function checkTimer() {
  const timer = store.get().ui.timer;
  if (!timer || isPaused(timer) || Date.now() < timer.end) return;
  notify({ appName: 'smart-shell', summary: t('timer.done'), body: timer.label || t('timer.title'), urgency: 'critical' });
  cancelTimer();
}
