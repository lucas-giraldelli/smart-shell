import { icon } from '../../../core/icons.js';
import { closePopover } from '../../../core/popover.js';
import { config } from '../../../data/config.js';
import { t, formatNumber } from '../../../i18n/index.js';

// CPU and memory: two items in the quick tile (free RAM, CPU load + die
// temperature) and one tab with the details. Real shell: /proc/stat,
// /proc/meminfo and the k10temp Tccd1 sensor.
const memStatus = s => (s.memFree < 4 ? 'crit' : s.memFree < 8 ? 'warn' : 'ok');
const tempStatus = s => (s.temp >= 87 ? 'crit' : s.temp >= 80 ? 'warn' : 'ok');
const points = list => list.map((v, i) => `${(i / (list.length - 1) * 100).toFixed(1)},${(19 - v / 100 * 17).toFixed(1)}`).join(' ');

export default {
  id: 'system',
  get label() { return t('system.label'); },
  icon: 'cpu',

  // one pane, two mini items
  quick: ({ system: s }) => [
    { icon: 'memory-stick', text: `${Math.round(s.memFree)} GiB`, width: '6ch', status: memStatus(s) === 'ok' ? null : memStatus(s) },
    { icon: 'cpu', text: `${Math.round(s.load)}% ${s.temp}°`, width: '7ch', status: tempStatus(s) === 'ok' ? null : tempStatus(s) },
  ],

  render: () => `
    <div class="sys-pane">
      <div class="sys-card" data-cpu>
        <div class="sys-head">${icon('cpu')}<span class="grow">${t('system.cpu')}</span><b data-load></b></div>
        <svg class="tl-line" viewBox="0 0 100 20" preserveAspectRatio="none"><polyline data-line="cpu"/></svg>
        <div class="meta" data-temp></div>
      </div>
      <div class="sys-card" data-mem>
        <div class="sys-head">${icon('memory-stick')}<span class="grow">${t('system.memory')}</span><b data-free></b></div>
        <div class="mem-bar"><i></i></div>
        <div class="meta" data-used></div>
      </div>
    </div>
    <div class="dk-head"><span></span>
      <button class="btn-s" data-monitor title="${config.commands.monitor}">${icon('external-link')}btop</button></div>`,

  update(root, { system: s }) {
    const cpu = root.querySelector('[data-cpu]'), mem = root.querySelector('[data-mem]');
    cpu.dataset.status = tempStatus(s);
    cpu.querySelector('[data-load]').textContent = `${Math.round(s.load)}%`;
    cpu.querySelector('[data-line="cpu"]').setAttribute('points', points(s.history));
    cpu.querySelector('[data-temp]').textContent = t('system.temp', { temp: s.temp });

    mem.dataset.status = memStatus(s);
    mem.querySelector('[data-free]').textContent = t('system.free', { free: formatNumber(s.memFree) });
    mem.querySelector('.mem-bar i').style.width = ((s.memTotal - s.memFree) / s.memTotal * 100).toFixed(1) + '%';
    mem.querySelector('[data-used]').textContent = t('system.used', { used: formatNumber(s.memTotal - s.memFree), total: s.memTotal });
  },

  click(target) {
    if (target.closest('[data-monitor]')) closePopover(); // runs config.commands.monitor in the real shell
  },
};
