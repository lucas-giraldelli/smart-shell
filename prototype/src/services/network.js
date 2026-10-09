import { update } from '../state.js';

// Simulated traffic: steady browsing with qBittorrent bursts (MB/s).
// Real shell: byte counters in /sys/class/net/<iface>/statistics.
const push = (list, v) => [...list.slice(1), v];

export function startNetwork() {
  setInterval(() => {
    const burst = Math.random() < 0.15;
    update('network', n => ({
      down: push(n.down, burst ? 4 + Math.random() * 18 : Math.random() * 1.2),
      up: push(n.up, Math.random() * (burst ? 2 : 0.4)),
    }));
  }, 1000);
}
