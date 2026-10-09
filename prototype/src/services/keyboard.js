import { store, update } from '../state.js';

// Caps Lock state. The prototype reads the real key through the browser;
// the real shell watches /sys/class/leds/*::capslock/brightness.
const set = on => { if (on !== store.get().keyboard.capsLock) update('keyboard', { capsLock: on }); };

export function startKeyboard() {
  addEventListener('keydown', e => {
    // On Linux the browser still reports the *old* state on the Caps Lock
    // keydown, so flip it right away instead of waiting for keyup.
    if (e.code === 'CapsLock') { if (!e.repeat) set(!store.get().keyboard.capsLock); }
    else set(e.getModifierState('CapsLock'));
  });
  // keyup carries the settled state: use it to correct any drift
  addEventListener('keyup', e => set(e.getModifierState('CapsLock')));
  addEventListener('mousedown', e => set(e.getModifierState('CapsLock')));
}

export const toggleCapsLock = () => update('keyboard', k => ({ capsLock: !k.capsLock }));
