import volume from './volume.js';
import brightness from './brightness.js';
import network from './network.js';
import docker from './docker.js';

// A pane is one feature of the quick tile + control center:
//   id, label, icon, requires?   identity and the capability it needs
//   quick(state)                 -> { icon, text, tone } for the mini item in the tile
//   wheel?(dir)                  scroll on the mini item (+1 up, -1 down)
//   render()                     static markup of the tab
//   update(root, state)          sync the tab with state (only while visible)
//   click?(target, root)         delegated clicks inside the tab
//   input?(key, value)           slider changes ([data-range=key])
export const panes = { volume, brightness, network, docker };

// Panes listed in config.quick, in config order. `available` is false when the
// pane's capability is missing: the item and tab are then shown disabled.
export const configuredPanes = (ids, caps) =>
  ids.map(id => panes[id]).filter(Boolean).map(pane => ({ pane, available: !pane.requires || caps[pane.requires] }));
