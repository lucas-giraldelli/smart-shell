import { store, update } from '../state.js';

// Simulated CPU / memory / temperature feed.
// Real shell: /proc/stat, /proc/meminfo and the k10temp Tccd1 sensor.
const TICK_MS = 900;
let burst = 0;

function tick() {
  const s = store.get().system;
  let load = s.load;
  if (s.auto) {
    // 5800X3D-style: calm baseline with sudden short spikes
    if (burst > 0) burst--;
    else if (Math.random() < 0.06) burst = 2 + Math.floor(Math.random() * 5);
    const target = burst ? 70 + Math.random() * 30 : 4 + Math.random() * 18;
    load += (target - load) * 0.55;
  }
  // free memory drifts slowly; `memHeavy` simulates a hungry workload
  const memTarget = s.memHeavy ? 5.2 : 26.4 - load * 0.03;
  const memFree = s.memFree + (memTarget - s.memFree) * 0.18 + (Math.random() - 0.5) * 0.15;
  update('system', { load, memFree, temp: Math.round(46 + load * 0.36), history: [...s.history.slice(1), load] });
}

export function startSystem() {
  setInterval(tick, TICK_MS);
  tick();
}
