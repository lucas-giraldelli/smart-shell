import { update } from '../state.js';

// Calendar events exported from Thunderbird by tools/thunderbird-events.py
// (a systemd timer refreshes ~/.cache/smart-shell/events.json; serve.sh links it
// into assets/local). Missing file = no events, not an error.
const URL = 'assets/local/events.json';
const REFRESH_MS = 60 * 1000;

// all-day dates are plain "YYYY-MM-DD": read them as local dates, not UTC
const parse = (value, allDay) => {
  if (!allDay) return new Date(value);
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};

async function refresh() {
  try {
    const res = await fetch(URL);
    if (!res.ok) return;
    const data = await res.json();
    update('events', {
      generatedAt: data.generatedAt,
      calendars: data.calendars ?? {},
      skipped: data.skipped ?? [],
      list: (data.events ?? []).map(e => ({ ...e, start: parse(e.start, e.allDay), end: parse(e.end, e.allDay) })),
    });
  } catch {
    // no export yet
  }
}

export function startEvents() {
  refresh();
  setInterval(refresh, REFRESH_MS);
}
