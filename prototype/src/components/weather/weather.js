import { Component, define } from '../../core/component.js';
import { icon } from '../../core/icons.js';
import { isOpen, openPopover, closePopover, cameFrom } from '../../core/popover.js';
import { describe } from '../../data/weather-codes.js';
import { setHTML } from '../ui/ui.js';
import './forecast.js';

// Current weather: icon and temperature, the condition on hover. Click opens
// the forecast (hours + 7 days).
class Weather extends Component {
  static slices = ['weather', 'ui'];

  render() {
    return `
      <span data-icon></span>
      <div class="wx-text"><div class="t-big" data-temp></div></div>
      <span class="label"></span>
      <ss-forecast></ss-forecast>`;
  }

  setup() {
    this.classList.add('tile', 'weather');
    this.dataset.popover = 'weather';
    this.addEventListener('click', e => {
      if (cameFrom(e, 'ss-forecast')) return;
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
    // the condition, on hover
    this.$('.label').textContent = look.label;
    this.toggleAttribute('data-tip', ui.popover !== 'weather');
  }
}

define('ss-weather', Weather);
