import { Component, define } from '../../core/component.js';
import { icon } from '../../core/icons.js';
import { describe } from '../../data/weather-codes.js';
import { setHTML } from '../ui/ui.js';

// Forecast popover inside the weather tile: now, the next hours and 7 days.
const WEEKDAY = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
const wxIcon = (code, isDay, extra = '') => {
  const look = describe(code, isDay);
  return `<span class="wx${extra}" style="--wx:${look.color}" title="${look.label}">${icon(look.icon)}</span>`;
};
const rain = p => (p >= 20 ? `<span class="rain">${icon('droplets')}${p}%</span>` : '<span class="rain"></span>');

function dayName(dateStr, i) {
  if (i === 0) return 'Hoje';
  if (i === 1) return 'Amanhã';
  const [y, m, d] = dateStr.split('-').map(Number);
  return WEEKDAY.format(new Date(y, m - 1, d)).replace('.', '');
}

class Forecast extends Component {
  static slices = ['weather', 'ui'];

  setup() {
    this.classList.add('menu', 'forecast');
  }

  update({ weather: w, ui }) {
    if (ui.popover !== 'weather') return;
    const c = w.current, look = describe(c.code, c.isDay), today = w.daily[0];
    // the 7-day bars share one scale: the week's coldest to hottest
    const lo = Math.min(...w.daily.map(d => d.min)), hi = Math.max(...w.daily.map(d => d.max));
    const pct = v => ((v - lo) / Math.max(1, hi - lo) * 100).toFixed(1);
    const updated = w.updatedAt
      ? `Open-Meteo · atualizado ${w.updatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
      : 'Previsão de exemplo · sem conexão';

    setHTML(this, `
      <div class="fc-now">
        ${wxIcon(c.code, c.isDay, ' big')}
        <div class="fc-temp">${c.temp}°</div>
        <div class="grow">
          <b>${look.label}</b>
          <div class="meta">${icon('map-pin')}${w.city}</div>
        </div>
        <div class="fc-range"><span>↑ ${today.max}°</span><span>↓ ${today.min}°</span></div>
      </div>
      <div class="fc-chips">
        <span>${icon('thermometer')}Sensação ${c.feels}°</span>
        <span>${icon('droplets')}${c.humidity}%</span>
        <span>${icon('wind')}${c.wind} km/h</span>
      </div>
      <div class="sec">Próximas horas</div>
      <div class="fc-hours">${w.hourly.slice(0, 12).map((h, i) => `
        <div class="hour">
          <span class="meta">${i === 0 ? 'Agora' : h.time.slice(0, 2) + 'h'}</span>
          ${wxIcon(h.code, h.isDay)}
          <b>${h.temp}°</b>
          ${rain(h.precip)}
        </div>`).join('')}
      </div>
      <div class="sec">7 dias</div>
      <div class="fc-days">${w.daily.map((d, i) => `
        <div class="day">
          <span class="name">${dayName(d.date, i)}</span>
          ${wxIcon(d.code, true)}
          ${rain(d.precip)}
          <span class="min">${d.min}°</span>
          <span class="range"><i style="left:${pct(d.min)}%; right:${100 - pct(d.max)}%"></i></span>
          <span class="max">${d.max}°</span>
        </div>`).join('')}
      </div>
      <div class="fc-foot meta">${updated}</div>`);
  }
}

define('ss-forecast', Forecast);
