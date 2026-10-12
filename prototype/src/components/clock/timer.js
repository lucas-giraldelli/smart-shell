import { store, update } from '../../state.js';
import { savePref } from '../../core/prefs.js';

// The clock timer (shell: services/Countdown.qml): minutes, an optional name
// and a colour, started from the clock's right-click popover. The clock shows
// it on its second line in that colour; when it ends it rings - the tile
// shakes and an alarm beeps (the shell plays the freedesktop alarm sound) -
// until a click stops it. The popover pauses / resumes or stops it. Saved ({ end,
// color, label, left, done }: `left` is the time left in ms while paused), so it
// survives a reload.

// light enough to tint the glass and stay readable as text on it
export const COLORS = ['#facc15', '#fb923c', '#f472b6', '#a78bfa', '#38bdf8', '#4ade80'];
// one click sets the minutes
export const PRESETS = [5, 10, 15, 30, 60];

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
export const isRinging = timer => timer?.done === true;
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

// three short beeps (Web Audio; a page may only play sound after a click,
// starting the timer was one)
let audio;
function beep() {
  try {
    audio ??= new AudioContext();
    for (let i = 0; i < 3; i++) {
      const o = audio.createOscillator(), g = audio.createGain(), at = audio.currentTime + i * 0.25;
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.15, at);
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.18);
      o.connect(g).connect(audio.destination);
      o.start(at);
      o.stop(at + 0.2);
    }
  } catch {}
}

// once a second (the clock's tick): an ended timer rings, beeping every
// 6.5 s for up to 5 minutes
let lastBeep = 0;
export function checkTimer() {
  const timer = store.get().ui.timer;
  if (!timer || isPaused(timer)) return;
  const now = Date.now();
  if (isRinging(timer)) {
    if (now - lastBeep >= 6500 && now - timer.end < 5 * 60000) { lastBeep = now; beep(); }
    return;
  }
  if (now < timer.end) return;
  lastBeep = 0;
  save({ ...timer, done: true });
}
