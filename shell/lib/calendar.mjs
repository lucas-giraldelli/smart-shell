// Calendar logic of the clock, ported from the prototype:
// prototype/src/data/holidays.js, data/categories.js, services/agenda.js and
// components/clock/calendar.js. Functions that produce text take the I18n
// singleton (`i18n.t`) first, since modules can't reach QML singletons.

// --- holidays (data/holidays.js) ---
// Holidays computed per year, so the calendar works for any month you navigate to.
// kind: 'holiday' (day off) or 'optional' (ponto facultativo / observance).
export const regions = {
  br: { color: '#facc15' },
  cba: { color: '#fb923c' },
  us: { color: '#60a5fa' },
};
export const regionName = (i18n, id) => i18n.t(`regions.${id}`);

const day = (y, m, d) => new Date(y, m - 1, d);
const addDays = (date, n) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);

// Gregorian Easter (anonymous algorithm)
function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), dd = ((h + l - 7 * m + 114) % 31) + 1;
  return day(y, month, dd);
}

// n-th weekday of a month (weekday 0 = Sunday); n = -1 means the last one
function nthWeekday(y, m, weekday, n) {
  if (n > 0) {
    const first = day(y, m, 1);
    return day(y, m, 1 + ((weekday - first.getDay() + 7) % 7) + (n - 1) * 7);
  }
  const last = day(y, m + 1, 0);
  return day(y, m, last.getDate() - ((last.getDay() - weekday + 7) % 7));
}

const RULES = {
  br: y => {
    const e = easter(y);
    return [
      [day(y, 1, 1), 'newYear'],
      [addDays(e, -48), 'carnival', 'optional'],
      [addDays(e, -47), 'carnival', 'optional'],
      [addDays(e, -46), 'ashWednesday', 'optional'],
      [addDays(e, -2), 'goodFriday'],
      [day(y, 4, 21), 'tiradentes'],
      [day(y, 5, 1), 'labour'],
      [addDays(e, 60), 'corpusChristi', 'optional'],
      [day(y, 9, 7), 'independenceBR'],
      [day(y, 10, 12), 'aparecida'],
      [day(y, 11, 2), 'allSouls'],
      [day(y, 11, 15), 'republic'],
      [day(y, 11, 20), 'blackConsciousness'], // national since Lei 14.759/2023
      [day(y, 12, 25), 'christmas'],
    ];
  },
  cba: y => [
    [day(y, 4, 8), 'cuiaba'],
    [day(y, 5, 9), 'matoGrosso'],
    [day(y, 12, 8), 'conception'],
  ],
  us: y => [
    [day(y, 1, 1), 'usNewYear'],
    [nthWeekday(y, 1, 1, 3), 'mlk'],
    [nthWeekday(y, 2, 1, 3), 'presidents'],
    [nthWeekday(y, 5, 1, -1), 'memorial'],
    [day(y, 6, 19), 'juneteenth'],
    [day(y, 7, 4), 'independenceUS'],
    [nthWeekday(y, 9, 1, 1), 'labor'],
    [nthWeekday(y, 10, 1, 2), 'columbus'],
    [day(y, 11, 11), 'veterans'],
    [nthWeekday(y, 11, 4, 4), 'thanksgiving'],
    [day(y, 12, 25), 'usChristmas'],
  ],
};

export const dateKey = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
export const sameDay = (a, b) => dateKey(a) === dateKey(b);

const cache = new Map(); // per year + regions + locale
// Map of dateKey -> [{ region, id, name, kind, date }] for one year and the given regions.
export function holidaysOf(i18n, year, enabled) {
  const key = `${year}:${enabled.join()}:${i18n.current}`;
  if (!cache.has(key)) {
    const map = new Map();
    for (const region of enabled) {
      // (no optional call in the loop head: Qt's JS compiler crashes on it)
      const rule = RULES[region];
      for (const [date, id, kind = 'holiday'] of rule ? rule(year) : []) {
        const k = dateKey(date);
        map.set(k, [...(map.get(k) ?? []), { region, id, name: i18n.t(`holidays.${id}`), kind, date }]);
      }
    }
    cache.set(key, map);
  }
  return cache.get(key);
}

// The next `count` holidays from `from` (inclusive), looking into next year if needed.
export function upcoming(i18n, from, enabled, count = 3) {
  // (no flatMap / flat: Qt's JS engine lacks them)
  const all = [from.getFullYear(), from.getFullYear() + 1]
    .reduce((list, y) => list.concat(...holidaysOf(i18n, y, enabled).values()), [])
    .filter(h => h.date >= new Date(from.getFullYear(), from.getMonth(), from.getDate()))
    .sort((a, b) => a.date - b.date);
  return all.slice(0, count);
}

// The month grid: 42 days from the Sunday on/before the 1st, each with its
// holidays and events, marked the way the prototype's classes are.
export function monthDays(i18n, view, selected, today, enabled, events) {
  const y = view.getFullYear(), m = view.getMonth();
  const start = new Date(y, m, 1 - new Date(y, m, 1).getDay());
  const holidays = new Map([...holidaysOf(i18n, y - 1, enabled), ...holidaysOf(i18n, y, enabled), ...holidaysOf(i18n, y + 1, enabled)]);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const list = holidays.get(dateKey(d)) ?? [];
    const dayEvents = eventsOn(events, d);
    return {
      date: d,
      other: d.getMonth() !== m,
      weekend: d.getDay() === 0 || d.getDay() === 6,
      today: sameDay(d, today),
      selected: sameDay(d, selected),
      holiday: list.some(h => h.kind === 'holiday'),
      holidays: list,
      // routine (recurring) meetings would mark nearly every weekday: only one-offs get a dash
      special: dayEvents.filter(e => !e.recurring),
    };
  });
}

// --- events (services/events.js, components/clock/calendar.js) ---
// all-day dates are plain "YYYY-MM-DD": read them as local dates, not UTC
export const parseDate = (value, allDay) => {
  if (!allDay) return new Date(value);
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// events touching a day (all-day ends are exclusive dates)
export function eventsOn(list, d) {
  const from = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const to = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  return list.filter(e => e.start < to && e.end > from);
}

export const titleOf = (i18n, e) => e.title || i18n.t('calendar.untitled');

// --- categories (data/categories.js) ---
// What an event is about decides its icon: from its calendar
// (config events.categories.calendars) or keywords in its title
// (events.categories.keywords); anything else is "personal".
export const categories = {
  work: { icon: 'briefcase' },
  health: { icon: 'stethoscope' },
  personal: { icon: 'user' },
};

// accent- and case-insensitive, so "Psicólogo" matches "psicologo"
const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function categoryOf(rules, event) {
  const byCalendar = rules?.calendars ?? {};
  for (const cal of event.calendars ?? []) {
    if (byCalendar[cal]) return byCalendar[cal];
  }
  const title = fold(event.title ?? '');
  for (const [category, words] of Object.entries(rules?.keywords ?? {})) {
    if (words.some(w => title.includes(fold(w)))) return category;
  }
  return 'personal';
}

// --- agenda (services/agenda.js) ---
// The event in progress and the next one starting within `remindMinutes`, each
// tagged with its category. All-day events never remind.
export function agenda(list, rules, remindMinutes, now = new Date()) {
  const remind = remindMinutes * 60 * 1000;
  const timed = list.filter(e => !e.allDay);
  const withCategory = e => (e ? Object.assign({}, e, { category: categoryOf(rules, e) }) : null);
  const ongoing = withCategory(timed.find(e => e.start <= now && e.end > now));
  const next = withCategory(timed
    .filter(e => e.start > now && e.start - now <= remind)
    .sort((a, b) => a.start - b.start)[0]);
  return { ongoing, upcoming: next, minutes: next ? Math.ceil((next.start - now) / 60000) : null };
}
