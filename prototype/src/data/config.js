// What the dock shows and in which order. This is the file a user edits
// (the real shell reads the same shape from ~/.config/smart-shell/config.json).
//
// `dock` is a list of groups; a separator is drawn between non-empty groups.
// Every id must exist in components/registry.js. Widgets can also be switched
// off at runtime from the dev panel (stored in `ui.hidden`).
export const config = {
  dock: [
    { id: 'workspaces', widgets: ['workspaces', 'capslock'] },
    { id: 'apps', widgets: ['apps'] },
    { id: 'status', tiles: true, widgets: ['music', 'weather', 'system', 'bluetooth', 'quick', 'tray', 'clock'] },
  ],

  // items in the quick tile; each one also gets a tab in the control center
  quick: ['volume', 'network', 'brightness', 'docker'],

  pets: { available: ['cat', 'shiba', 'fox', 'penguin', 'bunny', 'capy', 'frog'] },
};
