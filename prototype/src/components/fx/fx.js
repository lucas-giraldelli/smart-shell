import { Component, define } from '../../core/component.js';
import { onFrame } from '../../core/loop.js';
import { themes } from '../../data/themes.js';
import { snow } from './effects/snow.js';
import { bats } from './effects/bats.js';

// Full-screen particle layer; the active theme picks the effect (themes.js `fx`).
const EFFECTS = { snow, bats };

class Fx extends Component {
  static slices = ['ui'];

  render() {
    return '<canvas data-testid="fx-canvas"></canvas>';
  }

  setup() {
    this.canvas = this.$('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.t = 0;
    this.stopLoop = onFrame(dt => this.frame(dt));
  }

  teardown() {
    this.stopLoop();
  }

  // Keep the backing store at the canvas' real on-screen size. Sizing it from
  // innerWidth once is not enough: Firefox/Zen can report a different size,
  // and a stretched canvas blurs the flakes and misplaces the dock floor.
  fit() {
    const w = Math.round(this.canvas.clientWidth * devicePixelRatio);
    const h = Math.round(this.canvas.clientHeight * devicePixelRatio);
    if (w === this.canvas.width && h === this.canvas.height) return false;
    this.canvas.width = w;
    this.canvas.height = h;
    return true;
  }

  start(id) {
    this.effectId = id;
    this.canvas.dataset.effect = id ?? 'none';
    this.fit();
    this.draw = id ? EFFECTS[id](this.canvas) : null;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  update({ ui }) {
    const id = themes.find(t => t.id === ui.theme)?.fx ?? null;
    if (id !== this.effectId || this.draw === undefined) this.start(id);
  }

  frame(dt) {
    if (!this.draw) return;
    if (this.fit()) this.start(this.effectId);
    this.t += dt * 60;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // dock edges in CSS px relative to the canvas; effects multiply by devicePixelRatio
    const c = this.canvas.getBoundingClientRect();
    const d = document.querySelector('ss-dock')?.getBoundingClientRect();
    const dock = d ? { left: d.left - c.left, right: d.right - c.left, top: d.top - c.top } : { left: 0, right: 0, top: c.height };
    const stats = this.draw(this.ctx, dt, this.t, dock);
    // debug: what the effect is doing right now, readable in the inspector
    if (stats) for (const [key, value] of Object.entries(stats)) {
      const v = String(value);
      if (this.canvas.dataset[key] !== v) this.canvas.dataset[key] = v;
    }
  }
}

define('ss-fx', Fx);
