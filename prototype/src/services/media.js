import { store, update } from '../state.js';

// Advances the fake track. Real shell: MPRIS via Quickshell.Services.Mpris.
export function startMedia() {
  setInterval(() => {
    const m = store.get().media;
    if (m.playing) update('media', { progress: (m.progress + 0.004) % 1 });
  }, 1000);
}
