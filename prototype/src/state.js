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
    // workspaces: 'icons' | 'numbers' | 'dots' (an old wsIcons: false means dots)
    wsStyle: loadPref('wsStyle', loadPref('wsIcons', true) === false ? 'dots' : 'icons'),
    // one pet per dock (null = none); older saves kept a list, use its first pet
    pet: loadPref('pet', loadPref('pets', ['cat'])[0] ?? null),
    size: loadPref('size', 52),
    magnify: loadPref('magnify', 1.75),
    liveWallpaper: loadPref('liveWallpaper', false),
    popover: null,          // 'bluetooth' | 'control-center' | 'calendar' | 'weather' | null
    ccTab: 'volume',
  },
  caps: snap.capabilities,
  workspaces: { list: snap.workspaces, active: snap.activeWorkspace },
  apps: { list: snap.apps },
  system: {
    load: 20, auto: true,   // `auto` = simulated CPU; off = driven by the dev panel
    temp: 50,
    memTotal: snap.memory.totalGiB, memFree: snap.memory.freeGiB, memHeavy: false,
    history: Array(40).fill(0),  // recent CPU load, oldest first
    bootedAt: new Date(snap.bootedAt),
    top: snap.processes,         // memory users by executable, biggest first
  },
  keyboard: { capsLock: false },
  tray: { attention: [] },    // tray items needing attention (bounce)
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
  weather: { ...snap.weather, source: 'snapshot', updatedAt: null },
  events: { list: [], calendars: {}, skipped: [], generatedAt: null },
  agenda: { ongoing: null, upcoming: null, minutes: null },
  media: { ...snap.media, playing: true, progress: 0.32 },
});

export const update = store.update;
