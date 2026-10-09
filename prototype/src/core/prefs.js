// Per-browser preferences. Storage can be missing or blocked (private windows,
// previews), so every access is guarded and falls back to the default.
const PREFIX = 'smart-shell:';

export function loadPref(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function savePref(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {}
}
