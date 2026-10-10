// Widget id (as used in data/config.js) -> custom element. Display names are
// translated under `widgets.<id>`.
// `requires` names a capability (data/capabilities.js); without it the widget
// is rendered disabled.
// Adding a widget = create its folder, import it in components/index.js and
// register it here.
export const available = (def, caps) => !def.requires || caps[def.requires];

export const widgets = {
  workspaces: { tag: 'ss-workspaces' },
  capslock: { tag: 'ss-capslock' },
  apps: { tag: 'ss-app-row' },
  music: { tag: 'ss-music' },
  weather: { tag: 'ss-weather' },
  prs: { tag: 'ss-prs' },
  bluetooth: { tag: 'ss-bluetooth', requires: 'bluetooth' },
  quick: { tag: 'ss-quick' },
  tray: { tag: 'ss-tray' },
  clock: { tag: 'ss-clock' },
};
