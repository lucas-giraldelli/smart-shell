import { store } from '../state.js';
import { savePref } from '../core/prefs.js';

// Persist user preferences from the `ui` slice whenever they change.
const KEYS = ['theme', 'hidden', 'wsIcons', 'pets', 'size', 'magnify', 'liveWallpaper', 'holidayRegions'];

export function startPersist() {
  let previous = store.get().ui;
  store.subscribe((state, slice) => {
    if (slice !== 'ui') return;
    for (const key of KEYS) if (state.ui[key] !== previous[key]) savePref(key, state.ui[key]);
    previous = state.ui;
  });
}
