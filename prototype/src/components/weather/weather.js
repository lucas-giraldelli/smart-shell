import { Component, define } from '../../core/component.js';

// Current weather (the real shell reuses waybar's weather.sh).
class Weather extends Component {
  static slices = ['weather'];

  render() {
    return `
      <svg class="sun" viewBox="0 0 32 32">
        <g stroke="#fbbf24" stroke-width="2.4" stroke-linecap="round">
          <path d="M16 2v4M16 26v4M2 16h4M26 16h4M6.1 6.1l2.8 2.8M23.1 23.1l2.8 2.8M6.1 25.9l2.8-2.8M23.1 8.9l2.8-2.8"/>
        </g>
        <circle cx="16" cy="16" r="6.5" fill="#fcd34d"/>
      </svg>
      <div><div class="t-big" data-temp></div><div class="t-sub" data-summary></div></div>
      <span class="label" data-detail></span>`;
  }

  setup() {
    this.classList.add('tile');
    this.dataset.tip = '';
  }

  update({ weather: w }) {
    this.$('[data-temp]').textContent = `${w.temp}°`;
    this.$('[data-summary]').textContent = w.summary;
    this.$('[data-detail]').textContent = `Sensação ${w.feels}°C · Umidade ${w.humidity}% · Vento ${w.wind} km/h`;
  }
}

define('ss-weather', Weather);
