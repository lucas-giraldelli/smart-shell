import ptBR from './locales/pt-BR.js';
import en from './locales/en.js';

// Translations live in ./locales/<tag>.js as nested objects; t('a.b') reads one.
// Values are strings with {placeholders}, lists (returned as-is) or functions of the params (for
// plurals and anything grammar-dependent). Missing keys fall back to English,
// then to the key itself, so a gap is visible but never breaks the UI.
const LOCALES = { 'pt-BR': ptBR, en };
const FALLBACK = 'en';

let current = FALLBACK;

// Pick the best match for a BCP 47 tag: exact, then same language ("pt-PT" -> "pt-BR").
export function setLocale(tag) {
  const wanted = tag || navigator.language || FALLBACK;
  current = LOCALES[wanted] ? wanted
    : Object.keys(LOCALES).find(k => k.split('-')[0] === wanted.split('-')[0]) ?? FALLBACK;
  document.documentElement.lang = current;
}

export const locale = () => current;
export const locales = () => Object.keys(LOCALES);

const lookup = (dict, key) => key.split('.').reduce((node, part) => node?.[part], dict);

export function t(key, params = {}) {
  const value = lookup(LOCALES[current], key) ?? lookup(LOCALES[FALLBACK], key);
  if (value === undefined) return key;
  if (typeof value === 'function') return value(params);
  if (Array.isArray(value)) return value;
  return String(value).replace(/\{(\w+)\}/g, (_, name) => params[name] ?? `{${name}}`);
}

// Intl formatters for the current locale, cached per option set.
const cache = new Map();
export function dateFormat(options) {
  const key = current + JSON.stringify(options);
  if (!cache.has(key)) cache.set(key, new Intl.DateTimeFormat(current, options));
  return cache.get(key);
}
// Times follow the clock setting (ui.clockFormat), not the language:
// '24h' -> "14:05", '12h' -> "2:05 PM". setClockFormat() is called by main.js.
let clockFormat = '24h';
export const setClockFormat = f => { clockFormat = f === '12h' ? '12h' : '24h'; };
const pad = n => String(n).padStart(2, '0');
export const formatTime = d => (clockFormat === '12h'
  ? `${d.getHours() % 12 || 12}:${pad(d.getMinutes())} ${d.getHours() < 12 ? 'AM' : 'PM'}`
  : `${pad(d.getHours())}:${pad(d.getMinutes())}`);
// an hour on its own (the hourly forecast): "13h" / "1 PM"
export const formatHour = h => (clockFormat === '12h' ? `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}` : `${pad(h)}h`);
export const formatNumber = (n, digits = 1) =>
  new Intl.NumberFormat(current, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
