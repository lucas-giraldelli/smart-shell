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
export const formatTime = d => dateFormat({ hour: '2-digit', minute: '2-digit' }).format(d);
export const formatNumber = (n, digits = 1) =>
  new Intl.NumberFormat(current, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
