// Holidays computed per year, so the calendar works for any month you navigate to.
// kind: 'holiday' (day off) or 'optional' (ponto facultativo / observance).
export const regions = {
  br: { name: 'Brasil', color: '#facc15' },
  cba: { name: 'Cuiabá / MT', color: '#fb923c' },
  us: { name: 'EUA', color: '#60a5fa' },
};

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
      [day(y, 1, 1), 'Confraternização Universal'],
      [addDays(e, -48), 'Carnaval', 'optional'],
      [addDays(e, -47), 'Carnaval', 'optional'],
      [addDays(e, -46), 'Quarta-feira de Cinzas', 'optional'],
      [addDays(e, -2), 'Sexta-feira Santa'],
      [day(y, 4, 21), 'Tiradentes'],
      [day(y, 5, 1), 'Dia do Trabalho'],
      [addDays(e, 60), 'Corpus Christi', 'optional'],
      [day(y, 9, 7), 'Independência do Brasil'],
      [day(y, 10, 12), 'Nossa Senhora Aparecida'],
      [day(y, 11, 2), 'Finados'],
      [day(y, 11, 15), 'Proclamação da República'],
      [day(y, 11, 20), 'Dia da Consciência Negra'], // national since Lei 14.759/2023
      [day(y, 12, 25), 'Natal'],
    ];
  },
  cba: y => [
    [day(y, 4, 8), 'Aniversário de Cuiabá'],
    // TODO: confirm in the state decree (found only on third-party calendars)
    [day(y, 5, 9), 'Fundação de Mato Grosso'],
    // TODO: confirm Lei municipal 5.576/2012 is still in force
    [day(y, 12, 8), 'Nossa Senhora da Conceição'],
  ],
  us: y => [
    [day(y, 1, 1), "New Year's Day"],
    [nthWeekday(y, 1, 1, 3), 'Martin Luther King Jr. Day'],
    [nthWeekday(y, 2, 1, 3), "Presidents' Day"],
    [nthWeekday(y, 5, 1, -1), 'Memorial Day'],
    [day(y, 6, 19), 'Juneteenth'],
    [day(y, 7, 4), 'Independence Day'],
    [nthWeekday(y, 9, 1, 1), 'Labor Day'],
    [nthWeekday(y, 10, 1, 2), 'Columbus Day'],
    [day(y, 11, 11), 'Veterans Day'],
    [nthWeekday(y, 11, 4, 4), 'Thanksgiving'],
    [day(y, 12, 25), 'Christmas Day'],
  ],
};

export const dateKey = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

const cache = new Map();
// Map of dateKey -> [{ region, name, kind }] for one year and the given regions.
export function holidaysOf(year, enabled) {
  const key = `${year}:${enabled.join()}`;
  if (!cache.has(key)) {
    const map = new Map();
    for (const region of enabled) {
      for (const [date, name, kind = 'holiday'] of RULES[region]?.(year) ?? []) {
        const k = dateKey(date);
        map.set(k, [...(map.get(k) ?? []), { region, name, kind, date }]);
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
