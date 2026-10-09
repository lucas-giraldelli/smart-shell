import { store, update } from '../state.js';

// Caps Lock state. The prototype reads the real key through the browser;
// the real shell polls /sys/class/leds/*::capslock/brightness (as waybar does).
export function startKeyboard() {
  const sync = e => {
    const on = e.getModifierState?.('CapsLock');
    if (on !== undefined && on !== store.get().keyboard.capsLock) update('keyboard', { capsLock: on });
  };
  addEventListener('keydown', sync);
  addEventListener('keyup', sync);
  addEventListener('mousedown', sync);
}

export const toggleCapsLock = () => update('keyboard', k => ({ capsLock: !k.capsLock }));
