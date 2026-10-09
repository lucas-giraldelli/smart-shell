import { Component, define } from '../../core/component.js';
import { icon } from '../../core/icons.js';
import { store } from '../../state.js';
import { config } from '../../data/config.js';
import { regions, regionName, holidaysOf, upcoming, dateKey } from '../../data/holidays.js';
import { t, dateFormat, formatTime } from '../../i18n/index.js';

// Month calendar inside the clock tile: navigate months, weekends tinted,
// holidays dotted per region (config.holidays) and days with one-off events
// (not routine recurring meetings) marked with a dash in their calendar's
// colour. Selecting a day lists its holidays, all-day events as compact chips
// and the timed ones - today's finished ones folded away.
const monthTitle = d => dateFormat({ month: 'long', year: 'numeric' }).format(d);
const longDate = d => dateFormat({ weekday: 'long', day: 'numeric', month: 'long' }).format(d);
const short = d => dateFormat({ day: 'numeric', month: 'short' }).format(d).replace('.', ''); // "12 out" / "Oct 12"
const cap = s => s[0].toUpperCase() + s.slice(1);
const sameDay = (a, b) => dateKey(a) === dateKey(b);

// events touching a day (all-day ends are exclusive dates)
function eventsOn(list, d) {
  const from = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const to = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  return list.filter(e => e.start < to && e.end > from);
}

const colorOf = (e, colors) => colors[e.calendars[0]] ?? 'var(--accent)';
const titleOf = e => e.title || t('calendar.untitled');

const eventRow = (e, colors, past = false) => `
  <div class="evt${past ? ' past' : ''}" style="--rc:${colorOf(e, colors)}" title="${titleOf(e)}">
    <span class="bar"></span>
    <span class="when">${formatTime(e.start)}</span>
    <span class="grow">${titleOf(e)}</span>
    ${e.meet ? `<button class="ib meet" data-meet="${e.meet}" title="Google Meet">${icon('video')}</button>` : ''}
  </div>`;

// all-day events as one line of chips; the rest folds into "+N" (full list on hover)
const CHIP_LIMIT = 2;
function allDayChips(list, colors) {
  if (!list.length) return '';
  const shown = list.slice(0, CHIP_LIMIT).map(e =>
    `<span class="chip" style="--rc:${colorOf(e, colors)}" title="${titleOf(e)}">${titleOf(e)}</span>`).join('');
  const rest = list.slice(CHIP_LIMIT);
  const more = rest.length ? `<span class="chip more" title="${rest.map(titleOf).join(' · ')}">+${rest.length}</span>` : '';
  return `<div class="allday">${shown}${more}</div>`;
}

const holidayRow = h => `
  <div class="hol${h.kind === 'optional' ? ' optional' : ''}" style="--rc:${regions[h.region].color}">
    <span class="mark"></span><span class="grow">${h.name}</span><span class="meta">${regionName(h.region)}${h.kind === 'optional' ? ` · ${t('calendar.optional')}` : ''}</span>
  </div>`;

class Calendar extends Component {
  static slices = ['ui', 'events'];

  setup() {
    this.classList.add('menu', 'cal');
    const now = new Date();
    this.view = new Date(now.getFullYear(), now.getMonth(), 1);
    this.selected = now;

    this.addEventListener('click', e => {
      const t = e.target;
      // a Meet link opens in the browser (xdg-open in the real shell)
      const meet = t.closest('[data-meet]');
      if (meet) { window.open(meet.dataset.meet, '_blank'); return; }
      if (t.closest('[data-past]')) this.showPast = !this.showPast;
      else if (t.closest('[data-nav]')) this.shift(+t.closest('[data-nav]').dataset.nav);
      else if (t.closest('[data-today]')) this.goToday();
      else if (t.closest('[data-day]')) {
        const [y, m, d] = t.closest('[data-day]').dataset.day.split('-').map(Number);
        this.selected = new Date(y, m - 1, d);
        this.showPast = false;
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
    this.showPast = false;
  }

  update({ ui }) {
    const wasOpen = this.open;
    this.open = ui.popover === 'calendar';
    // every time it opens, start from today
    if (this.open && !wasOpen) this.goToday();
    if (this.open) this.draw();
  }

  draw() {
    const enabled = config.holidays.filter(r => regions[r]);
    const { list: events, calendars: colors, skipped } = store.get().events;
    const today = new Date();
    const y = this.view.getFullYear(), m = this.view.getMonth();
    const start = new Date(y, m, 1 - new Date(y, m, 1).getDay()); // the Sunday on/before the 1st
    const days = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    const holidays = new Map([...holidaysOf(y - 1, enabled), ...holidaysOf(y, enabled), ...holidaysOf(y + 1, enabled)]);
    const selectedList = holidays.get(dateKey(this.selected)) ?? [];
    const selectedEvents = eventsOn(events, this.selected);
    const hasDetails = selectedList.length + selectedEvents.length > 0;

    this.innerHTML = `
      <div class="cal-head">
        <button class="ib" data-nav="-1" title="${t('calendar.prevMonth')}">${icon('chevron-left')}</button>
        <b class="grow">${cap(monthTitle(this.view))}</b>
        <button class="btn-s" data-today>${t('calendar.today')}</button>
        <button class="ib" data-nav="1" title="${t('calendar.nextMonth')}">${icon('chevron-right')}</button>
      </div>
      <div class="week">${t('calendar.weekdays').map((w, i) => `<span class="${i === 0 || i === 6 ? 'weekend' : ''}">${w}</span>`).join('')}</div>
      <div class="grid">${days.map(d => {
        const list = holidays.get(dateKey(d)) ?? [];
        const cls = [
          d.getMonth() !== m && 'other', (d.getDay() === 0 || d.getDay() === 6) && 'weekend',
          sameDay(d, today) && 'today', sameDay(d, this.selected) && 'selected',
          list.some(h => h.kind === 'holiday') && 'holiday',
        ].filter(Boolean).join(' ');
        const dayEvents = eventsOn(events, d);
        // routine (recurring) meetings would mark nearly every weekday: only one-offs get a dash
        const special = dayEvents.filter(e => !e.recurring);
        const dots = list.map(h => `<i class="${h.kind}" style="--rc:${regions[h.region].color}"></i>`).join('')
          + (special.length ? `<b class="ev" style="--rc:${colorOf(special[0], colors)}"></b>` : '');
        const tip = [...list.map(h => h.name), ...dayEvents.map(e => e.title || t('calendar.untitled'))].join(' · ');
        return `<button data-day="${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}" class="${cls}" title="${tip}">
          ${d.getDate()}${dots ? `<span class="dots">${dots}</span>` : ''}</button>`;
      }).join('')}
      </div>
      ${hasDetails ? this.dayDetails(selectedList, selectedEvents, colors) : ''}
      ${hasDetails ? '' : `<div class="sec">${t('calendar.upcoming')}</div>
      ${upcoming(today, enabled, 3).map(h => holidayRow(h).replace('<span class="grow">', `<span class="when">${short(h.date)}</span><span class="grow">`)).join('')
        || ''}`}
      ${skipped.map(s => `<div class="skipped">${icon('triangle-alert')}<span>${
        t('calendar.skipped', { name: `<b>${s.name}</b>`, reason: t(`calendar.reasons.${s.reason}`) })}</span></div>`).join('')}`;
  }

  dayDetails(holidays, events, colors) {
    const now = new Date();
    const timed = events.filter(e => !e.allDay).sort((a, b) => a.start - b.start);
    // on today, meetings that already ended fold into one line
    const past = sameDay(this.selected, now) ? timed.filter(e => e.end <= now) : [];
    const rest = timed.filter(e => !past.includes(e));
    const toggle = past.length
      ? `<button class="past-toggle" data-past>${t(this.showPast ? 'calendar.hidePast' : 'calendar.showPast', { n: past.length })}</button>`
      : '';
    return `<div class="cal-day">
      <div class="day-head"><span class="day-title">${longDate(this.selected)}</span>${toggle}</div>
      ${allDayChips(events.filter(e => e.allDay), colors)}
      ${holidays.map(holidayRow).join('')}
      <div class="evt-list">
        ${this.showPast ? past.map(e => eventRow(e, colors, true)).join('') : ''}
        ${rest.map(e => eventRow(e, colors)).join('')}
      </div>
    </div>`;
  }
}

define('ss-calendar', Calendar);
