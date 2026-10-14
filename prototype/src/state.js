import { createStore } from './core/store.js';
import { loadPref } from './core/prefs.js';
import * as snap from './data/snapshot.js';
import { config } from './data/config.js';
import { fresh } from './components/pets/tama-rules.js';

// The whole app state. Each top-level key is a slice components can subscribe to;
// in the real shell every slice except `ui` is fed by a Quickshell service.
export const store = createStore({
  // user preferences (persisted) and transient UI state
  ui: {
    theme: loadPref('theme', 'glass'),
    hidden: loadPref('hidden', []),   // widget ids switched off in the dev panel
    // workspaces: 'icons' | 'numbers' | 'dots' (an old wsIcons: false means dots)
    wsStyle: loadPref('wsStyle', loadPref('wsIcons', true) === false ? 'dots' : 'icons'),
    clockFormat: loadPref('clockFormat', '24h'),  // '24h' | '12h', whatever the language
    audioDevices: loadPref('audioDevices', {}),   // device id -> { name, hidden }
    // one pet per dock (null = none); older saves kept a list, use its first pet
    pet: loadPref('pet', loadPref('pets', ['cat'])[0] ?? null),
    size: loadPref('size', 52),
    magnify: loadPref('magnify', 1.75),
    dnd: loadPref('dnd', false),   // do not disturb: only rules with `dnd: true` pop up
    liveWallpaper: loadPref('liveWallpaper', false),
    weatherFx: loadPref('weatherFx', false),   // the current weather drawn inside the dock
    tamaOn: loadPref('tamaOn', false),         // Tamagotchi mode: the pet has needs (pets/tama.js)
    timer: loadPref('timer', null),            // the clock timer: { end (ms), color, label } (clock/timer.js)
    timerLast: loadPref('timerLast', { minutes: 10, color: '#facc15', label: '' }),   // the next one starts from these
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
  // submap: Hyprland's current submap ('' = none; Alt+R enters 'resize')
  // recording: a screen recording in progress
  keyboard: { capsLock: false, submap: '', recording: false },
  tray: { attention: [] },    // tray items needing attention (bounce)
  bluetooth: { on: snap.bluetooth.on, busy: null, devices: snap.bluetooth.devices },
  audio: {
    volume: snap.audio.volume, muted: false,
    sinks: snap.audio.sinks, sink: snap.audio.sink,
    mic: snap.audio.mic.volume, micName: snap.audio.mic.name, micMuted: false,
    streams: snap.audio.streams,
  },
  display: { name: snap.display.name, brightness: snap.display.brightness, night: false, nightK: 4500 },
  // vpnState: off | authenticating | connecting | on | error
  network: { ...snap.network, vpnState: 'off', down: Array(40).fill(0), up: Array(40).fill(0) },
  docker: snap.docker,
  weather: { ...snap.weather, source: 'snapshot', updatedAt: null },
  // the user's open PRs (gh); `merged` ones linger until the next look
  // `hidden`: repos the user hid (saved); `showHidden`: the popover lists them too
  // services: the config's torrents.services, all answering; vpn: qBittorrent connected
  // tracker: the account on a UNIT3D tracker (its /api/user)
  torrents: { tracker: snap.tracker, list: snap.torrents, dlspeed: 3145728, upspeed: 524288, loading: false, vpn: true,
    services: config.torrents.services.map(s => ({ ...s, up: true })) },
  prs: { list: snap.prs, updatedAt: null, loading: false, hidden: loadPref('prsHidden', []), showHidden: false },
  events: { list: [], calendars: {}, skipped: [], generatedAt: null },
  notifications: { list: [] },   // popups on screen, oldest first
  agenda: { ongoing: null, upcoming: null, minutes: null },
  // the pet's needs in Tamagotchi mode (pets/tama.js); `speed` speeds time up in the mock
  tama: { ...fresh(Date.now()), ...loadPref('tama', {}), speed: 1 },
  // `volume` / `muted`: the YouTube Music app's own stream (right click on the tile)
  // `art`: the cover (mpris:artUrl), none in the snapshot
  media: { ...snap.media, art: null, playing: true, progress: 0.32, volume: 70, muted: false },
});

export const update = store.update;
