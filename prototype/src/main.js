import { loadIcons } from './core/icons.js';
import { startPopovers } from './core/popover.js';
import { startTheme } from './services/theme.js';
import { startPersist } from './services/persist.js';
import { startSystem } from './services/system.js';
import { startNetwork } from './services/network.js';
import { startMedia } from './services/media.js';

// Icons are inlined synchronously by components, so load them before any
// element is defined.
await loadIcons();

startTheme();
startPersist();
startPopovers();
startSystem();
startNetwork();
startMedia();

await import('./components/index.js');
