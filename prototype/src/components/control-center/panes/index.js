import volume from './volume.js';
import brightness from './brightness.js';
import network from './network.js';
import docker from './docker.js';
import system from './system.js';
import settings from './settings.js';

// A pane is one feature of the quick tile + control center:
//   id, label, icon, requires?   identity and the capability it needs
//   quick?(state)                -> { icon, text, tone, status, width? } for the mini item in the tile,
//                                   a list of them for several items, or omitted for a tab-only pane
//   quickWidth                   fixed text width of that item, so values never shift the dock
//   wheel?(dir)                  scroll on the mini item (+1 up, -1 down)
//   render()                     static markup of the tab
//   update(root, state)          sync the tab with state (only while visible)
//   click?(target, root)         delegated clicks inside the tab
//   input?(key, value)           slider changes ([data-range=key])
export const panes = { volume, brightness, network, docker, system, settings };

// Panes listed in config.quick, in config order. `available` is false when the
// pane's capability is missing: the item and tab are then shown disabled.
export const configuredPanes = (ids, caps) =>
  ids.map(id => panes[id]).filter(Boolean).map(pane => ({ pane, available: !pane.requires || caps[pane.requires] }));
