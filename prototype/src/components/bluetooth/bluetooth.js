import { Component, define } from '../../core/component.js';
import { icon } from '../../core/icons.js';
import { isOpen, openPopover, closePopover, cameFrom } from '../../core/popover.js';
import { setPower, toggleDevice, connectedDevice } from '../../services/bluetooth.js';
import { row, toggle, setHTML } from '../ui/ui.js';
import { missingText } from '../../data/capabilities.js';
import { t } from '../../i18n/index.js';

// Click toggles the adapter; right-click opens the device menu (like blueman).
// The tile is just the icon (crossed out when off) and only grows - with an
// animation - to name the headset while one is connecting or connected.
class Bluetooth extends Component {
  static slices = ['bluetooth', 'ui'];

  render() {
    return `
      <span data-icon></span>
      <div class="bt-body"><div class="bt-name" data-name></div><div class="t-sub" data-sub></div></div>
      <span class="label"></span>
      <div class="menu"></div>`;
  }

  setup() {
    this.classList.add('tile', 'bt');
    this.dataset.tip = '';
    this.dataset.popover = 'bluetooth';
    this.menu = this.$('.menu');
    this.addEventListener('click', e => {
      if (this.hasAttribute('data-unavailable')) return;
      if (cameFrom(e, '.bt > .menu')) return this.menuClick(e.target);
      setPower(!this.state.on);
    });
    this.addEventListener('contextmenu', e => {
      e.preventDefault();
      if (this.hasAttribute('data-unavailable')) return;
      isOpen('bluetooth') ? closePopover() : openPopover('bluetooth');
    });
  }

  menuClick(target) {
    const r = target.closest('[data-act]');
    if (!r) return;
    if (r.dataset.act === 'power') setPower(!this.state.on);
    else if (r.dataset.act === 'device') toggleDevice(+r.dataset.i);
    else closePopover(); // "open manager" - blueman-manager in the real shell
  }

  update({ bluetooth: bt, ui }) {
    this.state = bt;
    if (this.hasAttribute('data-unavailable')) {
      this.$('[data-icon]').innerHTML = icon('bluetooth-off', 'bt-ic');
      this.$('[data-name]').textContent = 'Bluetooth';
      this.classList.add('off');
      this.$('.label').textContent = missingText('bluetooth');
      return;
    }
    const conn = connectedDevice(bt);
    const busy = bt.busy !== null;
    const device = conn ?? (busy ? bt.devices[bt.busy] : null);
    this.classList.toggle('expanded', !!device);
    this.classList.toggle('connecting', busy);
    this.toggleAttribute('data-open', ui.popover === 'bluetooth');
    this.classList.toggle('off', !bt.on);
    setHTML(this.$('[data-icon]'), icon(!bt.on ? 'bluetooth-off' : conn ? 'bluetooth-connected' : 'bluetooth', 'bt-ic'));
    // keep the last name while collapsing, so the text doesn't vanish mid-animation
    if (device) {
      this.$('[data-name]').textContent = device.name;
      this.$('[data-sub]').textContent = busy ? t('bluetooth.connecting') : t('bluetooth.headset', { battery: device.battery });
    }
    this.$('.label').textContent = t(bt.on ? 'bluetooth.turnOff' : 'bluetooth.turnOn');

    setHTML(this.menu, [
      row({ icon: 'bluetooth', title: 'Bluetooth', trailing: toggle(bt.on), attrs: 'data-act="power"' }),
      `<div class="menu-sep"></div><div class="sec">${t('bluetooth.paired')}</div>`,
      ...bt.devices.map((d, i) => row({
        icon: 'headphones', title: d.name, active: d.connected, attrs: `data-act="device" data-i="${i}"`,
        meta: bt.busy === i ? t('bluetooth.connecting') : d.connected ? t('bluetooth.connected', { battery: d.battery }) : t('bluetooth.disconnected'),
        trailing: bt.busy === i ? '' : `<span class="action">${t(d.connected ? 'bluetooth.disconnect' : 'bluetooth.connect')}</span>`,
      })),
      '<div class="menu-sep"></div>',
      row({ title: t('bluetooth.manager'), attrs: 'data-act="manager"' }),
    ].join(''));
  }
}

define('ss-bluetooth', Bluetooth);
