import { Component, define } from '../../core/component.js';

class Clock extends Component {
  static slices = [];

  render() {
    return '<div class="t-big" data-time></div><div class="t-sub" data-date></div>';
  }

  setup() {
    this.classList.add('tile', 'clock');
    this.tick();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  teardown() {
    clearInterval(this.timer);
  }

  tick() {
    const d = new Date();
    this.$('[data-time]').textContent = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    this.$('[data-date]').textContent = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).replace(/\./g, '');
  }
}

define('ss-clock', Clock);
