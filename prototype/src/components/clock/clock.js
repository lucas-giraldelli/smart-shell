import { Component, define } from '../../core/component.js';
import { isOpen, openPopover, closePopover } from '../../core/popover.js';
import './calendar.js';

// Time and date. Click opens the month calendar.
class Clock extends Component {
  static slices = ['ui'];

  render() {
    return '<div class="t-big" data-time></div><div class="t-sub" data-date></div><ss-calendar></ss-calendar>';
  }

  setup() {
    this.classList.add('tile', 'clock');
    this.dataset.popover = 'calendar';
    this.addEventListener('click', e => {
      if (e.target.closest('ss-calendar')) return;
      isOpen('calendar') ? closePopover() : openPopover('calendar');
    });
    this.tick();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  teardown() {
    clearInterval(this.timer);
  }

  update({ ui }) {
    this.toggleAttribute('data-open', ui.popover === 'calendar');
  }

  tick() {
    const d = new Date();
    this.$('[data-time]').textContent = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    this.$('[data-date]').textContent = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).replace(/\./g, '');
  }
}

define('ss-clock', Clock);
