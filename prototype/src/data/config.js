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
    { id: 'status', tiles: true, widgets: ['music', 'tray', 'bluetooth', 'quick', 'weather', 'clock'] },
  ],

  // items in the quick tile; each one also gets a tab in the control center
  quick: ['volume', 'brightness', 'docker', 'network', 'system', 'settings'],

  // programs the shell opens from its buttons (run through the shell)
  commands: {
    monitor: 'kitty --class=btop-float -e btop',
    docker: "kitty --title lazydocker sh -c 'cd ~ && lazydocker'",
  },

  // pets dance while one of these players plays (substrings of its url,
  // identity, desktop entry or command line): YouTube Music
  pets: { available: ['cat', 'shiba', 'fox', 'penguin', 'bunny', 'capy', 'frog'], danceWith: ['music.youtube.com'] },

  // UI language (a tag from src/i18n/locales); unset = the browser's language
  locale: null,

  // MPRIS players the music tile never shows (substrings of identity, desktop
  // entry, title, url or command line): WhatsApp's voice messages by default
  music: { ignore: ['whatsapp'] },

  // one set of thresholds for the quick tile's colours and the pets:
  //   cpu (%): the pet sleeps below `sleep`, idles below `idle`, walks below
  //     `walk`, runs above
  //   memFreeGiB: free RAM below `warn` / `crit` - warn colours, a heavy pet
  //   tempC: the die temperature (Tccd1) from `warn` / `crit` - warn colours, a
  //     reddish pet with heat waves; with `roomTemp` set, warn / crit are
  //     degrees over that room temperature instead
  thresholds: {
    cpu: { sleep: 15, idle: 50, walk: 85 },
    memFreeGiB: { warn: 8, crit: 4 },
    tempC: { warn: 85, crit: 99, roomTemp: null },
  },

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
