import { Component, define } from '../../core/component.js';
import { store, update } from '../../state.js';
import { savePref } from '../../core/prefs.js';
import { themes } from '../../data/themes.js';
import { capabilities } from '../../data/capabilities.js';
import { widgets } from '../registry.js';
import { species } from '../pets/pets.js';
import { t, locale, locales } from '../../i18n/index.js';

// Prototype-only controls: themes, pets, which widgets are on, simulated
// backends and tuning. Not part of the real shell.
const chip = (attr, id, name, swatch, extra = '') =>
  `<button ${attr}="${id}"><span class="sw" style="background:${swatch}"></span>${name}${extra}</button>`;
const check = (attr, id, label) => `<label class="check"><input type="checkbox" ${attr}="${id}"> ${label}</label>`;

class DevPanel extends Component {
  static slices = ['ui', 'system', 'caps', 'network', 'docker'];

  render() {
    return `
      <button class="dp-toggle" title="${t('dev.show')}">⚙</button>
      <aside class="dp">
        <h1>${t('dev.title')}</h1>
        <p>${t('dev.intro')}</p>
        <div class="dp-row"><label>${t('dev.language')}</label>
          <select data-locale>${locales().map(l => `<option value="${l}"${l === locale() ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
        <h2>${t('dev.theme')}</h2>
        <div class="chips">${themes.map((th, i) => chip('data-theme-id', th.id, t(`themes.${th.id}`), th.swatch, `<kbd>${i + 1}</kbd>`)).join('')}</div>
        <h2>${t('dev.pets')}</h2>
        <div class="chips">${Object.entries(species).map(([k, s]) => chip('data-pet', k, t(`pets.names.${k}`), s.color)).join('')}</div>
        <h2>${t('dev.widgets')}</h2>
        <div class="checks">${Object.keys(widgets).map(id => check('data-widget', id, t(`widgets.${id}`))).join('')}</div>
        ${check('data-opt', 'wsIcons', t('dev.wsIcons'))}
        <h2>${t('dev.backends')}</h2>
        <div class="checks">${Object.entries(capabilities).map(([id, c]) => check('data-cap', id, c.label)).join('')}</div>
        <h2>${t('dev.failures')}</h2>
        <div class="checks">
          ${check('data-fail', 'offline', t('dev.offline'))}
          ${check('data-fail', 'dockerDown', t('dev.dockerDown'))}
          ${check('data-fail', 'containerError', t('dev.containerError'))}
        </div>
        <h2>${t('dev.tuning')}</h2>
        <div class="dp-row"><label>${t('dev.cpuLoad')}</label><input type="range" min="0" max="100" data-set="load"><output data-out="load"></output></div>
        ${check('data-opt', 'cpuAuto', t('dev.cpuAuto'))}
        <div class="dp-row"><label>${t('dev.size')}</label><input type="range" min="40" max="72" data-set="size"><output data-out="size"></output></div>
        <div class="dp-row"><label>${t('dev.magnify')}</label><input type="range" min="100" max="220" data-set="magnify"><output data-out="magnify"></output></div>
        ${check('data-opt', 'liveWallpaper', t('dev.liveWallpaper'))}
        <div class="hint">${t('dev.hint')}<br>${t('dev.keys', { n: themes.length })}</div>
      </aside>`;
  }

  setup() {
    this.classList.add('dev-panel');
    const panel = this.$('.dp');
    const togglePanel = () => panel.classList.toggle('hidden');
    this.$('.dp-toggle').addEventListener('click', togglePanel);

    this.addEventListener('click', e => {
      const t = e.target.closest('[data-theme-id], [data-pet]');
      if (t?.dataset.themeId) update('ui', { theme: t.dataset.themeId });
      if (t?.dataset.pet) {
        const k = t.dataset.pet, pets = store.get().ui.pets;
        update('ui', { pets: pets.includes(k) ? pets.filter(p => p !== k) : [...pets, k] });
      }
    });
    this.addEventListener('change', e => {
      const { widget, cap, opt, fail } = e.target.dataset;
      const on = e.target.checked;
      if (widget) {
        const hidden = store.get().ui.hidden.filter(id => id !== widget);
        update('ui', { hidden: on ? hidden : [...hidden, widget] });
      }
      if (cap) update('caps', { [cap]: on });
      if (fail === 'offline') update('network', { online: !on });
      if (fail === 'dockerDown') update('docker', { running: !on });
      if (fail === 'containerError') {
        // qbittorrent stuck restarting, like a broken VPN dependency would leave it
        update('docker', d => ({
          containers: d.containers.map(c => (c.name === 'qbittorrent' ? { ...c, state: on ? 'restarting' : 'running' } : c)),
        }));
      }
      // the UI is rendered once per page load, so a new language means a reload
      if (e.target.matches('[data-locale]')) { savePref('locale', e.target.value); location.reload(); return; }
      if (opt === 'cpuAuto') update('system', { auto: on });
      else if (opt) update('ui', { [opt]: on });
    });
    this.addEventListener('input', e => {
      const key = e.target.dataset.set;
      const v = +e.target.value;
      if (key === 'load') update('system', { load: v, auto: false });
      if (key === 'size') update('ui', { size: v });
      if (key === 'magnify') update('ui', { magnify: v / 100 });
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
    this.$('[data-fail="dockerDown"]').checked = !docker.running;
    this.$('[data-fail="containerError"]').checked = docker.containers.some(c => c.state === 'restarting');
    this.querySelectorAll('[data-theme-id]').forEach(b => b.classList.toggle('on', b.dataset.themeId === ui.theme));
    this.querySelectorAll('[data-pet]').forEach(b => b.classList.toggle('on', ui.pets.includes(b.dataset.pet)));
    this.querySelectorAll('[data-widget]').forEach(c => { c.checked = !ui.hidden.includes(c.dataset.widget); });
    this.querySelectorAll('[data-cap]').forEach(c => { c.checked = !!caps[c.dataset.cap]; });
    this.$('[data-opt="wsIcons"]').checked = ui.wsIcons;
    this.$('[data-opt="liveWallpaper"]').checked = ui.liveWallpaper;
    this.$('[data-opt="cpuAuto"]').checked = system.auto;

    const set = (key, value, out) => {
      const input = this.$(`[data-set="${key}"]`);
      if (document.activeElement !== input) input.value = value;
      this.$(`[data-out="${key}"]`).textContent = out;
    };
    set('load', Math.round(system.load), system.auto ? t('dev.auto') : Math.round(system.load) + '%');
    set('size', ui.size, ui.size + 'px');
    set('magnify', Math.round(ui.magnify * 100), ui.magnify.toFixed(2) + '×');
  }
}

define('ss-dev-panel', DevPanel);
