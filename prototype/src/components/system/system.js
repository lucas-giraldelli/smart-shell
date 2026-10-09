import { Component, define } from '../../core/component.js';
import { update } from '../../state.js';

const CIRC = 94.25; // 2πr for r=15
const fmt = v => v.toFixed(1).replace('.', ',');

// One widget for the machine's health: CPU load in the ring, free memory as the
// headline (with a usage bar) and the die temperature (k10temp Tccd1).
class System extends Component {
  static slices = ['system'];

  render() {
    return `
      <div class="ring"><svg viewBox="0 0 36 36"><circle class="trk" cx="18" cy="18" r="15"/><circle class="val" cx="18" cy="18" r="15" stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC}"/></svg><b data-load></b></div>
      <div class="sys-body">
        <div class="sys-top">
          <span class="t-big" data-free></span><span class="unit">GiB</span>
          <span class="temp" data-temp></span>
        </div>
        <div class="bar"><i></i></div>
      </div>
      <span class="label" data-detail></span>`;
  }

  setup() {
    this.classList.add('tile', 'sys');
    this.dataset.tip = '';
    // prototype only: click simulates a memory-hungry workload
    this.addEventListener('click', () => update('system', s => ({ memHeavy: !s.memHeavy })));
  }

  update({ system: s }) {
    const load = Math.round(s.load);
    const ring = this.$('.ring');
    ring.querySelector('.val').style.strokeDashoffset = (CIRC * (1 - Math.min(s.load / 100, 1))).toFixed(2);
    ring.classList.toggle('hot', s.load > 80);
    this.$('[data-load]').textContent = load;

    this.$('[data-free]').textContent = Math.round(s.memFree);
    this.$('.bar i').style.width = ((s.memTotal - s.memFree) / s.memTotal * 100).toFixed(1) + '%';
    this.classList.toggle('mem-low', s.memFree < 8 && s.memFree >= 4);
    this.classList.toggle('mem-crit', s.memFree < 4);

    const temp = this.$('[data-temp]');
    temp.textContent = `${s.temp}°C`;
    temp.className = 'temp' + (s.temp >= 87 ? ' crit' : s.temp >= 80 ? ' warm' : '');

    this.$('[data-detail]').textContent =
      `CPU ${load}% · die (Tccd1) ${s.temp}°C · ${fmt(s.memFree)} GiB livres de ${s.memTotal}`;
  }
}

define('ss-system', System);
