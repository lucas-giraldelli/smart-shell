import { Component, define } from '../../core/component.js';
import { appIcon } from '../../core/icons.js';
import { onFrame } from '../../core/loop.js';
import { store, update } from '../../state.js';

// Pinned/running apps with macOS-style magnification and reflections.
class AppRow extends Component {
  static slices = ['apps'];

  setup() {
    this.classList.add('apps');
    this.mouseX = null;
    this.addEventListener('mousemove', e => { this.mouseX = e.clientX; });
    this.addEventListener('mouseleave', () => { this.mouseX = null; });
    this.addEventListener('click', e => this.launch(e.target.closest('.app')));
    this.addEventListener('contextmenu', e => {
      const el = e.target.closest('.app');
      if (!el) return;
      e.preventDefault();
      this.setRunning(+el.dataset.i, false);
    });
    this.stopLoop = onFrame(() => this.magnify());
  }

  teardown() {
    this.stopLoop();
  }

  update({ apps }) {
    if (this.list !== apps.list) {
      const rebuild = !this.list || this.list.length !== apps.list.length;
      this.list = apps.list;
      if (rebuild) {
        this.innerHTML = apps.list.map((a, i) => `
          <div class="app" data-i="${i}">
            <img class="ic" src="${appIcon(a.icon)}" alt="${a.name}" draggable="false">
            <div class="refl"><img src="${appIcon(a.icon)}" alt=""></div>
            <span class="dot"></span><span class="label">${a.name}</span>
          </div>`).join('');
        this.items = [...this.children].map(el => ({ el, s: 1 }));
      }
    }
    apps.list.forEach((a, i) => this.items[i].el.classList.toggle('running', a.running));
  }

  setRunning(i, running) {
    update('apps', s => ({ list: s.list.map((a, j) => (j === i ? { ...a, running } : a)) }));
  }

  launch(el) {
    if (!el) return;
    const i = +el.dataset.i;
    if (store.get().apps.list[i].running) {
      el.classList.remove('focus'); void el.offsetWidth; el.classList.add('focus');
      return;
    }
    el.classList.add('launching');
    setTimeout(() => { el.classList.remove('launching'); this.setRunning(i, true); }, 1240);
  }

  // cosine falloff around the cursor, eased every frame
  magnify() {
    if (!this.items) return;
    const { size, magnify } = store.get().ui;
    const range = size * 2.8;
    for (const item of this.items) {
      let target = 1;
      if (this.mouseX !== null) {
        const r = item.el.getBoundingClientRect();
        const d = Math.abs(this.mouseX - (r.left + r.width / 2));
        if (d < range) target = 1 + (magnify - 1) * Math.cos((d / range) * Math.PI / 2) ** 2;
      }
      if (item.s === target) continue;
      item.s += (target - item.s) * 0.2;
      if (Math.abs(target - item.s) < 0.002) item.s = target;
      item.el.style.setProperty('--s', item.s.toFixed(4));
    }
  }
}

define('ss-app-row', AppRow);
