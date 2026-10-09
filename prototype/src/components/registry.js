// Widget id (as used in data/config.js) -> custom element + display name.
// `requires` names a capability (data/capabilities.js); without it the widget
// is rendered disabled.
// Adding a widget = create its folder, import it in components/index.js and
// register it here.
export const available = (def, caps) => !def.requires || caps[def.requires];

export const widgets = {
  workspaces: { tag: 'ss-workspaces', name: 'Workspaces' },
  capslock: { tag: 'ss-capslock', name: 'Caps Lock' },
  apps: { tag: 'ss-app-row', name: 'Apps' },
  music: { tag: 'ss-music', name: 'Música' },
  weather: { tag: 'ss-weather', name: 'Clima' },
  system: { tag: 'ss-system', name: 'Sistema (RAM/CPU)' },
  bluetooth: { tag: 'ss-bluetooth', name: 'Bluetooth', requires: 'bluetooth' },
  quick: { tag: 'ss-quick', name: 'Controles rápidos' },
  tray: { tag: 'ss-tray', name: 'Tray' },
  clock: { tag: 'ss-clock', name: 'Relógio' },
};
