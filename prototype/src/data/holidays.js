import { t } from '../i18n/index.js';

// Holidays computed per year, so the calendar works for any month you navigate to.
// kind: 'holiday' (day off) or 'optional' (ponto facultativo / observance).
// Names are translation keys under `holidays.*`; regions under `regions.*`.
export const regions = {
  br: { color: '#facc15' },
  cba: { color: '#fb923c' },
  us: { color: '#60a5fa' },
};
export const regionName = id => t(`regions.${id}`);

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
    // TODO: confirm in the state decree (found only on third-party calendars)
    [day(y, 5, 9), 'matoGrosso'],
    // TODO: confirm Lei municipal 5.576/2012 is still in force
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

const cache = new Map(); // per year + regions; the locale is fixed for a page load
// Map of dateKey -> [{ region, name, kind }] for one year and the given regions.
export function holidaysOf(year, enabled) {
  const key = `${year}:${enabled.join()}`;
  if (!cache.has(key)) {
    const map = new Map();
    for (const region of enabled) {
      for (const [date, id, kind = 'holiday'] of RULES[region]?.(year) ?? []) {
        const k = dateKey(date);
        map.set(k, [...(map.get(k) ?? []), { region, id, name: t(`holidays.${id}`), kind, date }]);
      }
    }
    cache.set(key, map);
  }
  return cache.get(key);
}

// The next `count` holidays from `from` (inclusive), looking into next year if needed.
export function upcoming(from, enabled, count = 3) {
  const all = [from.getFullYear(), from.getFullYear() + 1]
    .flatMap(y => [...holidaysOf(y, enabled).values()].flat())
    .filter(h => h.date >= new Date(from.getFullYear(), from.getMonth(), from.getDate()))
    .sort((a, b) => a.date - b.date);
  return all.slice(0, count);
}
