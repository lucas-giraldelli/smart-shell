// One shared requestAnimationFrame loop. Callbacks receive the frame delta in
// seconds (capped, so a backgrounded tab doesn't teleport the pets).
const callbacks = new Set();
let last = 0;

function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  for (const fn of callbacks) fn(dt);
  requestAnimationFrame(frame);
}

export function onFrame(fn) {
  if (callbacks.size === 0) {
    last = performance.now();
    requestAnimationFrame(frame);
  }
  callbacks.add(fn);
  return () => callbacks.delete(fn);
}
