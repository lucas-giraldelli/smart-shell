import { Component, define } from '../../core/component.js';
import { store, update } from '../../state.js';
import { themes } from '../../data/themes.js';
import { capabilities } from '../../data/capabilities.js';
import { t } from '../../i18n/index.js';

// Prototype-only controls: simulated backends, failures, CPU load and the
// animated wallpaper. Dock settings live in the control center's Dock tab.
// Not part of the real shell.
const check = (attr, id, label) => `<label class="check"><input type="checkbox" ${attr}="${id}"> ${label}</label>`;

class DevPanel extends Component {
  static slices = ['ui', 'system', 'caps', 'network', 'docker'];

  render() {
    return `
      <button class="dp-toggle" title="${t('dev.show')}">⚙</button>
      <aside class="dp">
        <h1>${t('dev.title')}</h1>
        <p>${t('dev.intro')}</p>
        <h2>${t('dev.backends')}</h2>
        <div class="checks">${Object.entries(capabilities).map(([id, c]) => check('data-cap', id, c.label)).join('')}</div>
        <h2>${t('dev.failures')}</h2>
        <div class="checks">
          ${check('data-fail', 'offline', t('dev.offline'))}
          ${check('data-fail', 'dockerDown', t('dev.dockerDown'))}
          ${check('data-fail', 'containerError', t('dev.containerError'))}
          ${check('data-fail', 'memHeavy', t('dev.memHeavy'))}
        </div>
        <h2>${t('dev.tuning')}</h2>
        <div class="dp-row"><label>${t('dev.cpuLoad')}</label><input type="range" min="0" max="100" data-set="load"><output data-out="load"></output></div>
        ${check('data-opt', 'cpuAuto', t('dev.cpuAuto'))}
        ${check('data-opt', 'liveWallpaper', t('dev.liveWallpaper'))}
        <div class="hint">${t('dev.hint')}<br>${t('dev.keys', { n: themes.length })}</div>
      </aside>`;
  }

  setup() {
    this.classList.add('dev-panel');
    const panel = this.$('.dp');
    const togglePanel = () => panel.classList.toggle('hidden');
    this.$('.dp-toggle').addEventListener('click', togglePanel);

    this.addEventListener('change', e => {
      const { cap, opt, fail } = e.target.dataset;
      const on = e.target.checked;
      if (cap) update('caps', { [cap]: on });
      if (fail === 'offline') update('network', { online: !on });
      if (fail === 'memHeavy') update('system', { memHeavy: on });
      if (fail === 'dockerDown') update('docker', { running: !on });
      if (fail === 'containerError') {
        // qbittorrent stuck restarting, like a broken VPN dependency would leave it
        update('docker', d => ({
          containers: d.containers.map(c => (c.name === 'qbittorrent' ? { ...c, state: on ? 'restarting' : 'running' } : c)),
        }));
      }
      if (opt === 'cpuAuto') update('system', { auto: on });
      else if (opt) update('ui', { [opt]: on });
    });
    this.addEventListener('input', e => {
      const key = e.target.dataset.set;
      const v = +e.target.value;
      if (key === 'load') update('system', { load: v, auto: false });
    });
    addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'h' || e.key === 'H') togglePanel();
      const n = +e.key;
      if (n >= 1 && n <= themes.length) update('ui', { theme: themes[n - 1].id });
    });
  }

  update({ ui, system, caps, network, docker }) {
    this.$('[data-fail="offline"]').checked = !network.online;
    this.$('[data-fail="memHeavy"]').checked = system.memHeavy;
    this.$('[data-fail="dockerDown"]').checked = !docker.running;
    this.$('[data-fail="containerError"]').checked = docker.containers.some(c => c.state === 'restarting');
    this.querySelectorAll('[data-cap]').forEach(c => { c.checked = !!caps[c.dataset.cap]; });
    this.$('[data-opt="liveWallpaper"]').checked = ui.liveWallpaper;
    this.$('[data-opt="cpuAuto"]').checked = system.auto;

    const set = (key, value, out) => {
      const input = this.$(`[data-set="${key}"]`);
      if (document.activeElement !== input) input.value = value;
      this.$(`[data-out="${key}"]`).textContent = out;
    };
    set('load', Math.round(system.load), system.auto ? t('dev.auto') : Math.round(system.load) + '%');
  }
}

define('ss-dev-panel', DevPanel);
