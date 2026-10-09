import { createStore } from './core/store.js';
import { loadPref } from './core/prefs.js';
import * as snap from './data/snapshot.js';

// The whole app state. Each top-level key is a slice components can subscribe to;
// in the real shell every slice except `ui` is fed by a Quickshell service.
export const store = createStore({
  // user preferences (persisted) and transient UI state
  ui: {
    theme: loadPref('theme', 'glass'),
    hidden: loadPref('hidden', []),   // widget ids switched off in the dev panel
    wsIcons: loadPref('wsIcons', true),
    pets: loadPref('pets', ['cat', 'shiba', 'capy']),
    size: loadPref('size', 52),
    magnify: loadPref('magnify', 1.75),
    liveWallpaper: loadPref('liveWallpaper', true),
    popover: null,          // 'bluetooth' | 'control-center' | null
    ccTab: 'volume',
  },
  caps: snap.capabilities,
  workspaces: { list: snap.workspaces, active: snap.activeWorkspace },
  apps: { list: snap.apps },
  system: {
    load: 20, auto: true,   // `auto` = simulated CPU; off = driven by the dev panel
    temp: 50,
    memTotal: snap.memory.totalGiB, memFree: snap.memory.freeGiB, memHeavy: false,
  },
  keyboard: { capsLock: false },
  bluetooth: { on: snap.bluetooth.on, busy: null, devices: snap.bluetooth.devices },
  audio: {
    volume: snap.audio.volume, muted: false,
    sinks: snap.audio.sinks, sink: snap.audio.sink,
    mic: snap.audio.mic.volume, micName: snap.audio.mic.name, micMuted: false,
    streams: snap.audio.streams,
  },
  display: { name: snap.display.name, brightness: snap.display.brightness, night: false, nightK: 4500 },
  network: { ...snap.network, vpnOn: false, down: Array(40).fill(0), up: Array(40).fill(0) },
  docker: snap.docker,
  weather: snap.weather,
  media: { ...snap.media, playing: true, progress: 0.32 },
});

export const update = store.update;
