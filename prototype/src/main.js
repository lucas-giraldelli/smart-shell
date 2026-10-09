import { loadIcons } from './core/icons.js';
import { startPopovers } from './core/popover.js';
import { startTheme } from './services/theme.js';
import { startPersist } from './services/persist.js';
import { startSystem } from './services/system.js';
import { startNetwork } from './services/network.js';
import { startMedia } from './services/media.js';
import { startKeyboard } from './services/keyboard.js';
import { startWeather } from './services/weather.js';
import { startEvents } from './services/events.js';

// Icons are inlined synchronously by components, so load them before any
// element is defined.
await loadIcons();

startTheme();
startPersist();
startPopovers();
startSystem();
startNetwork();
startMedia();
startKeyboard();
startWeather();
startEvents();

await import('./components/index.js');
