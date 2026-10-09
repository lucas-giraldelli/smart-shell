// Default configuration: what the dock shows and in which order. The user's
// ~/.config/smart-shell/config.json (see config/config.example.json) is merged
// over it - objects key by key, everything else (lists included) replaced;
// serve.sh links it into assets/local for the prototype.
//
// `dock` is a list of groups; a separator is drawn between non-empty groups.
// Every id must exist in components/registry.js. Widgets can also be switched
// off at runtime from the dev panel (stored in `ui.hidden`).
export const config = {
  dock: [
    { id: 'workspaces', widgets: ['workspaces', 'capslock'] },
    { id: 'apps', widgets: ['apps'] },
    { id: 'status', tiles: true, widgets: ['music', 'weather', 'system', 'bluetooth', 'quick', 'tray', 'clock'] },
  ],

  // items in the quick tile; each one also gets a tab in the control center
  quick: ['volume', 'network', 'brightness', 'docker'],

  pets: { available: ['cat', 'shiba', 'fox', 'penguin', 'bunny', 'capy', 'frog'] },

  // UI language (a tag from src/i18n/locales); unset = the browser's language
  locale: null,

  // holiday regions marked on the calendar (see data/holidays.js)
  holidays: ['br', 'cba', 'us'],

  // calendar events (exported from Thunderbird); categories drive icons and pets
  events: {
    remindMinutes: 10,
    categories: {
      calendars: {},
      keywords: {
        health: ['médico', 'medico', 'consulta', 'cardiologista', 'psicólogo', 'psiquiatra', 'dentista', 'exame', 'terapia'],
      },
    },
  },
};

const isObject = v => v && typeof v === 'object' && !Array.isArray(v);
function merge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (isObject(value) && isObject(target[key])) merge(target[key], value);
    else target[key] = value;
  }
}

// Merge the user's config over the defaults. A missing or broken file leaves
// the defaults in place.
export async function loadUserConfig() {
  try {
    const res = await fetch('assets/local/config.json');
    if (res.ok) merge(config, await res.json());
  } catch (err) {
    console.warn('[config] ignoring assets/local/config.json:', err);
  }
}
