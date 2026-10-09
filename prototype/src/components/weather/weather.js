import { Component, define } from '../../core/component.js';
import { icon } from '../../core/icons.js';
import { isOpen, openPopover, closePopover } from '../../core/popover.js';
import { describe } from '../../data/weather-codes.js';
import { setHTML } from '../ui/ui.js';
import './forecast.js';

// Current weather. Click opens the forecast (hours + 7 days).
class Weather extends Component {
  static slices = ['weather', 'ui'];

  render() {
    return `
      <span data-icon></span>
      <div><div class="t-big" data-temp></div><div class="t-sub" data-summary></div></div>
      <ss-forecast></ss-forecast>`;
  }

  setup() {
    this.classList.add('tile', 'weather');
    this.dataset.popover = 'weather';
    this.addEventListener('click', e => {
      if (e.target.closest('ss-forecast')) return;
      isOpen('weather') ? closePopover() : openPopover('weather');
    });
  }

  update({ weather: w, ui }) {
    const c = w.current;
    const look = describe(c.code, c.isDay);
    this.toggleAttribute('data-open', ui.popover === 'weather');
    this.style.setProperty('--wx', look.color);
    setHTML(this.$('[data-icon]'), icon(look.icon, `wx-ic${look.icon === 'sun' ? ' spin' : ''}`));
    this.$('[data-temp]').textContent = `${c.temp}°`;
    this.$('[data-summary]').textContent = look.label;
  }
}

define('ss-weather', Weather);
