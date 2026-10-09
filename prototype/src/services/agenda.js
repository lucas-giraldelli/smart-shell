import { store, update } from '../state.js';
import { config } from '../data/config.js';

// Derives what's happening now from the exported events: the event in progress
// and the next one starting within config.events.remindMinutes. All-day events
// never remind. Re-evaluated every 15 s and whenever the events change.
const TICK_MS = 15 * 1000;

function evaluate() {
  const now = new Date();
  const remind = (config.events?.remindMinutes ?? 10) * 60 * 1000;
  const timed = store.get().events.list.filter(e => !e.allDay);
  const ongoing = timed.find(e => e.start <= now && e.end > now) ?? null;
  const upcoming = timed
    .filter(e => e.start > now && e.start - now <= remind)
    .sort((a, b) => a.start - b.start)[0] ?? null;
  const prev = store.get().agenda;
  const minutes = upcoming ? Math.ceil((upcoming.start - now) / 60000) : null;
  if (prev.ongoing !== ongoing || prev.upcoming !== upcoming || prev.minutes !== minutes) {
    update('agenda', { ongoing, upcoming, minutes });
  }
}

export function startAgenda() {
  evaluate();
  setInterval(evaluate, TICK_MS);
  store.subscribe((_, slice) => { if (slice === 'events') evaluate(); });
}
