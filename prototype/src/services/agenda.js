import { store, update } from '../state.js';
import { config } from '../data/config.js';
import { categoryOf } from '../data/categories.js';

// Derives what's happening now from the exported events: the event in progress
// and the next one starting within config.events.remindMinutes, each tagged
// with its category. All-day events never remind. Re-evaluated every 15 s and
// whenever the events change.
const TICK_MS = 15 * 1000;

function evaluate() {
  const now = new Date();
  const remind = (config.events?.remindMinutes ?? 10) * 60 * 1000;
  const timed = store.get().events.list.filter(e => !e.allDay);
  const withCategory = e => (e ? { ...e, category: categoryOf(e) } : null);
  const ongoing = withCategory(timed.find(e => e.start <= now && e.end > now));
  const upcoming = withCategory(timed
    .filter(e => e.start > now && e.start - now <= remind)
    .sort((a, b) => a.start - b.start)[0]);
  const prev = store.get().agenda;
  const minutes = upcoming ? Math.ceil((upcoming.start - now) / 60000) : null;
  const same = (a, b) => (!a && !b) || (!!a && !!b && a.title === b.title && +a.start === +b.start);
  if (!same(prev.ongoing, ongoing) || !same(prev.upcoming, upcoming) || prev.minutes !== minutes) {
    update('agenda', { ongoing, upcoming, minutes });
  }
}

export function startAgenda() {
  evaluate();
  setInterval(evaluate, TICK_MS);
  store.subscribe((_, slice) => { if (slice === 'events') evaluate(); });
}
