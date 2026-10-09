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
    return '<canvas></canvas>';
  }

  setup() {
    this.canvas = this.$('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.t = 0;
    this.resize = () => {
      this.canvas.width = innerWidth * devicePixelRatio;
      this.canvas.height = innerHeight * devicePixelRatio;
      this.start(this.effectId);
    };
    addEventListener('resize', this.resize);
    this.stopLoop = onFrame(dt => this.frame(dt));
  }

  teardown() {
    removeEventListener('resize', this.resize);
    this.stopLoop();
  }

  start(id) {
    this.effectId = id;
    if (!this.canvas.width) this.resize();
    this.draw = id ? EFFECTS[id](this.canvas) : null;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  update({ ui }) {
    const id = themes.find(t => t.id === ui.theme)?.fx ?? null;
    if (id !== this.effectId || this.draw === undefined) this.start(id);
  }

  frame(dt) {
    if (!this.draw) return;
    this.t += dt * 60;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const dock = document.querySelector('ss-dock')?.getBoundingClientRect() ?? { left: 0, right: 0, top: innerHeight };
    this.draw(this.ctx, dt, this.t, dock);
  }
}

define('ss-fx', Fx);
