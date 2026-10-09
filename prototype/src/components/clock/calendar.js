import { Component, define } from '../../core/component.js';
import { icon } from '../../core/icons.js';
import { store, update } from '../../state.js';
import { regions, holidaysOf, upcoming, dateKey } from '../../data/holidays.js';

// Month calendar inside the clock tile: navigate months, weekends tinted,
// holidays dotted per region (toggle regions with the chips). No events.
const MONTH = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
const LONG = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
const MON = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
const short = d => `${d.getDate()} ${MON.format(d).replace('.', '')}`; // "12 out"
const cap = s => s[0].toUpperCase() + s.slice(1);
const WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const sameDay = (a, b) => dateKey(a) === dateKey(b);

const holidayRow = h => `
  <div class="hol${h.kind === 'optional' ? ' optional' : ''}" style="--rc:${regions[h.region].color}">
    <span class="mark"></span><span class="grow">${h.name}</span><span class="meta">${regions[h.region].name}${h.kind === 'optional' ? ' · facultativo' : ''}</span>
  </div>`;

class Calendar extends Component {
  static slices = ['ui'];

  setup() {
    this.classList.add('menu', 'cal');
    const now = new Date();
    this.view = new Date(now.getFullYear(), now.getMonth(), 1);
    this.selected = now;

    this.addEventListener('click', e => {
      const t = e.target;
      if (t.closest('[data-nav]')) this.shift(+t.closest('[data-nav]').dataset.nav);
      else if (t.closest('[data-today]')) this.goToday();
      else if (t.closest('[data-region]')) {
        const r = t.closest('[data-region]').dataset.region, list = store.get().ui.holidayRegions;
        update('ui', { holidayRegions: list.includes(r) ? list.filter(x => x !== r) : [...list, r] });
        return;
      } else if (t.closest('[data-day]')) {
        const [y, m, d] = t.closest('[data-day]').dataset.day.split('-').map(Number);
        this.selected = new Date(y, m - 1, d);
        if (m - 1 !== this.view.getMonth()) this.view = new Date(y, m - 1, 1);
      } else return;
      this.draw();
    });
    // scroll over the grid to change month
    this.addEventListener('wheel', e => {
      if (!e.target.closest('.grid')) return;
      e.preventDefault();
      this.shift(e.deltaY > 0 ? 1 : -1);
      this.draw();
    }, { passive: false });
  }

  shift(n) {
    this.view = new Date(this.view.getFullYear(), this.view.getMonth() + n, 1);
  }

  goToday() {
    const now = new Date();
    this.view = new Date(now.getFullYear(), now.getMonth(), 1);
    this.selected = now;
  }

  update({ ui }) {
    const wasOpen = this.open;
    this.open = ui.popover === 'calendar';
    // every time it opens, start from today
    if (this.open && !wasOpen) this.goToday();
    if (this.open) this.draw();
  }

  draw() {
    const enabled = store.get().ui.holidayRegions;
    const today = new Date();
    const y = this.view.getFullYear(), m = this.view.getMonth();
    const start = new Date(y, m, 1 - new Date(y, m, 1).getDay()); // the Sunday on/before the 1st
    const days = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    const holidays = new Map([...holidaysOf(y - 1, enabled), ...holidaysOf(y, enabled), ...holidaysOf(y + 1, enabled)]);
    const selectedList = holidays.get(dateKey(this.selected)) ?? [];

    this.innerHTML = `
      <div class="cal-head">
        <button class="ib" data-nav="-1" title="Mês anterior">${icon('chevron-left')}</button>
        <b class="grow">${cap(MONTH.format(this.view))}</b>
        <button class="btn-s" data-today>Hoje</button>
        <button class="ib" data-nav="1" title="Próximo mês">${icon('chevron-right')}</button>
      </div>
      <div class="regions">${Object.entries(regions).map(([id, r]) => `
        <button data-region="${id}" class="${enabled.includes(id) ? 'on' : ''}" style="--rc:${r.color}"><span class="mark"></span>${r.name}</button>`).join('')}
      </div>
      <div class="week">${WEEK.map((w, i) => `<span class="${i === 0 || i === 6 ? 'weekend' : ''}">${w}</span>`).join('')}</div>
      <div class="grid">${days.map(d => {
        const list = holidays.get(dateKey(d)) ?? [];
        const cls = [
          d.getMonth() !== m && 'other', (d.getDay() === 0 || d.getDay() === 6) && 'weekend',
          sameDay(d, today) && 'today', sameDay(d, this.selected) && 'selected',
          list.some(h => h.kind === 'holiday') && 'holiday',
        ].filter(Boolean).join(' ');
        const dots = list.map(h => `<i class="${h.kind}" style="--rc:${regions[h.region].color}"></i>`).join('');
        return `<button data-day="${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}" class="${cls}" title="${list.map(h => h.name).join(' · ')}">
          ${d.getDate()}<span class="dots">${dots}</span></button>`;
      }).join('')}
      </div>
      <div class="cal-day">
        <div class="sec">${LONG.format(this.selected)}</div>
        ${selectedList.length ? selectedList.map(holidayRow).join('') : '<div class="meta none">Nenhum feriado neste dia</div>'}
      </div>
      <div class="sec">Próximos feriados</div>
      ${upcoming(today, enabled, 3).map(h => holidayRow(h).replace('<span class="grow">', `<span class="when">${short(h.date)}</span><span class="grow">`)).join('')
        || '<div class="meta none">Nenhuma região selecionada</div>'}`;
  }
}

define('ss-calendar', Calendar);
