import { store, update } from '../state.js';

// Bluetooth actions. Real shell: BlueZ via Quickshell.Bluetooth
// (`bluetoothctl power on|off`, `connect|disconnect <mac>`).
const CONNECT_MS = 1300;

export function setPower(on) {
  update('bluetooth', bt => ({
    on,
    busy: on ? bt.busy : null,
    devices: on ? bt.devices : bt.devices.map(d => ({ ...d, connected: false })),
  }));
}

export function toggleDevice(index) {
  const bt = store.get().bluetooth;
  if (bt.busy !== null) return;
  if (bt.devices[index].connected) {
    update('bluetooth', { devices: bt.devices.map((d, i) => (i === index ? { ...d, connected: false } : d)) });
    return;
  }
  // connecting powers the adapter on, like blueman does; one headset at a time
  update('bluetooth', { on: true, busy: index });
  setTimeout(() => {
    update('bluetooth', s => ({ busy: null, devices: s.devices.map((d, i) => ({ ...d, connected: i === index })) }));
  }, CONNECT_MS);
}

export const connectedDevice = bt => bt.devices.find(d => d.connected);
