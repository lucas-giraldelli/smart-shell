import { Component, define } from '../../core/component.js';
import { store, update } from '../../state.js';
import { themes } from '../../data/themes.js';
import { capabilities } from '../../data/capabilities.js';
import { widgets } from '../registry.js';
import { species } from '../pets/pets.js';

// Prototype-only controls: themes, pets, which widgets are on, simulated
// backends and tuning. Not part of the real shell.
const chip = (attr, id, name, swatch, extra = '') =>
  `<button ${attr}="${id}"><span class="sw" style="background:${swatch}"></span>${name}${extra}</button>`;
const check = (attr, id, label) => `<label class="check"><input type="checkbox" ${attr}="${id}"> ${label}</label>`;

class DevPanel extends Component {
  static slices = ['ui', 'system', 'caps', 'network', 'docker'];

  render() {
    return `
      <button class="dp-toggle" title="Mostrar painel (H)">⚙</button>
      <aside class="dp">
        <h1>smart-shell · protótipo</h1>
        <p>Maquete em HTML. O shell real roda em Quickshell (QML) com o mesmo visual.</p>
        <h2>Tema</h2>
        <div class="chips">${themes.map((t, i) => chip('data-theme-id', t.id, t.name, t.swatch, `<kbd>${i + 1}</kbd>`)).join('')}</div>
        <h2>Pets</h2>
        <div class="chips">${Object.entries(species).map(([k, s]) => chip('data-pet', k, s.name, s.color)).join('')}</div>
        <h2>Widgets</h2>
        <div class="checks">${Object.entries(widgets).map(([id, w]) => check('data-widget', id, w.name)).join('')}</div>
        ${check('data-opt', 'wsIcons', 'Ícone nos workspaces não selecionados')}
        <h2>Backends instalados (simulação)</h2>
        <div class="checks">${Object.entries(capabilities).map(([id, c]) => check('data-cap', id, c.label)).join('')}</div>
        <h2>Simular falhas</h2>
        <div class="checks">
          ${check('data-fail', 'offline', 'Rede caiu')}
          ${check('data-fail', 'dockerDown', 'Docker parado')}
          ${check('data-fail', 'containerError', 'Container com erro')}
        </div>
        <h2>Ajustes</h2>
        <div class="dp-row"><label>Carga da CPU</label><input type="range" min="0" max="100" data-set="load"><output data-out="load"></output></div>
        ${check('data-opt', 'cpuAuto', 'CPU simulada (picos estilo X3D)')}
        <div class="dp-row"><label>Tamanho</label><input type="range" min="40" max="72" data-set="size"><output data-out="size"></output></div>
        <div class="dp-row"><label>Ampliação</label><input type="range" min="100" max="220" data-set="magnify"><output data-out="magnify"></output></div>
        ${check('data-opt', 'liveWallpaper', 'Wallpaper animado')}
        <div class="hint">Clique num app para abrir · botão direito fecha · clique no bloco rápido abre a central · roda no volume/brilho · clique no sistema simula RAM cheia · clique num pet.<br>H esconde o painel · 1–${themes.length} troca o tema</div>
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
    set('load', Math.round(system.load), system.auto ? 'auto' : Math.round(system.load) + '%');
    set('size', ui.size, ui.size + 'px');
    set('magnify', Math.round(ui.magnify * 100), ui.magnify.toFixed(2) + '×');
  }
}

define('ss-dev-panel', DevPanel);
