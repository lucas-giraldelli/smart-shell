import { loadIcons } from './core/icons.js';
import { config, loadUserConfig } from './data/config.js';
import { setLocale } from './i18n/index.js';
import { loadPref } from './core/prefs.js';
import { startPopovers } from './core/popover.js';
import { startTheme } from './services/theme.js';
import { startPersist } from './services/persist.js';
import { startSystem } from './services/system.js';
import { startNetwork } from './services/network.js';
import { startMedia } from './services/media.js';
import { startKeyboard } from './services/keyboard.js';
import { startWeather } from './services/weather.js';
import { startEvents } from './services/events.js';
import { startAgenda } from './services/agenda.js';

// Icons are inlined synchronously by components and the layout comes from the
// config, so load both before any element is defined.
await Promise.all([loadIcons(), loadUserConfig()]);
// language: dev-panel choice, then config.locale, then the browser's
setLocale(loadPref('locale', null) ?? config.locale);

startTheme();
startPersist();
startPopovers();
startSystem();
startNetwork();
startMedia();
startKeyboard();
startWeather();
startEvents();
startAgenda();

await import('./components/index.js');
