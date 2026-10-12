import { Component, define } from '../../core/component.js';
import { icon } from '../../core/icons.js';
import { isOpen, openPopover, closePopover, cameFrom } from '../../core/popover.js';
import { categories } from '../../data/categories.js';
import { t, dateFormat, formatTime, locale } from '../../i18n/index.js';
import { setHTML } from '../ui/ui.js';
import { store } from '../../state.js';
import { COLORS, startTimer, cancelTimer, remainingText, checkTimer } from './timer.js';
import './calendar.js';

// Time and date. Shortly before an event (config.events.remindMinutes) the tile
// turns orange (warn); while an event runs it turns green (ok). Either way the
// date moves up next to the time and the event's name, with its category icon,
// takes the second line. A running timer (timer.js) takes it the same way, in
// its own colour, when no event does. Click opens the month calendar, right
// click the timer.
class Clock extends Component {
  static slices = ['ui', 'agenda'];

  render() {
    return `
      <div class="clock-top"><span class="t-big" data-time></span><span class="t-sub mini-date" data-mini></span></div>
      <div class="sub-line"><div class="ticker">
        <div class="t-sub" data-date></div>
        <div class="t-sub remind"><span class="cat"></span><span class="rtext"></span><span class="meet-ic">${icon('video')}</span></div>
      </div></div>
      <span class="label"></span>
      <ss-calendar></ss-calendar>
      <div class="timer-pop" data-popover="timer"><div class="menu timer-menu"></div></div>`;
  }

  setup() {
    this.classList.add('tile', 'clock');
    this.dataset.popover = 'calendar';
    this.addEventListener('contextmenu', e => {
      e.preventDefault();
      if (cameFrom(e, '.timer-pop')) return;
      isOpen('timer') ? closePopover() : openPopover('timer');
    });
    this.addEventListener('keydown', e => {
      if (e.key === 'Enter' && cameFrom(e, '.timer-menu input')) this.startIt();
    });
    this.addEventListener('click', e => {
      if (cameFrom(e, 'ss-calendar')) return;
      if (cameFrom(e, '.timer-pop')) return this.timerClick(e.target);
      // the reminder's video icon joins the Meet; the rest opens the calendar
      const event = store.get().agenda.upcoming ?? store.get().agenda.ongoing;
      if (event?.meet && e.target.closest('.meet-ic')) { window.open(event.meet, '_blank'); return; }
      isOpen('calendar') ? closePopover() : openPopover('calendar');
    });
    this.tick();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  startIt() {
    const minutes = parseInt(this.$('[data-min]').value, 10);
    if (!(minutes > 0)) return;
    startTimer(minutes, this.picked, this.$('[data-name]').value.trim());
    closePopover();
  }

  timerClick(target) {
    const sw = target.closest('[data-color]');
    if (sw) {
      this.picked = sw.dataset.color;
      this.querySelectorAll('.tm-sw').forEach(b => b.classList.toggle('on', b === sw));
    }
    if (target.closest('[data-start]')) this.startIt();
    if (target.closest('[data-cancel]')) cancelTimer();
  }

  // the timer popover: minutes (no limit), an optional name and a colour,
  // then Start (or Enter); while one runs, what's left and Cancel. Rendered
  // when it opens or the timer starts / stops, so typing isn't wiped.
  renderTimerMenu(ui) {
    const open = ui.popover === 'timer';
    this.$('.timer-pop').toggleAttribute('data-open', open);
    const key = `${open}|${!!ui.timer}`;
    if (key === this.timerKey) return;
    this.timerKey = key;
    const menu = this.$('.timer-menu');
    if (ui.timer) {
      setHTML(menu, `
        <div class="sec">${t('timer.title')}</div>
        <div class="tm-run">
          <span class="tm-ic" style="color:${ui.timer.color}">${icon('timer')}</span>
          <b data-left>${remainingText(ui.timer)}</b>
          <span class="meta grow">${ui.timer.label}</span>
          <button class="btn-s" data-cancel>${icon('x')}${t('timer.cancel')}</button>
        </div>`);
      return;
    }
    const last = ui.timerLast;
    this.picked = last.color;
    setHTML(menu, `
      <div class="sec">${t('timer.title')}</div>
      <div class="tm-form">
        <label class="tm-field tm-min"><input data-min inputmode="numeric" value="${last.minutes}"><span>${t('timer.minutes')}</span></label>
        <input class="tm-field" data-name placeholder="${t('timer.name')}" value="${last.label}" spellcheck="false">
      </div>
      <div class="tm-foot">
        <div class="tm-colors">${COLORS.map(c => `<button class="tm-sw${c === last.color ? ' on' : ''}" data-color="${c}" style="--c:${c}"></button>`).join('')}</div>
        <button class="btn-s" data-start>${icon('timer')}${t('timer.start')}</button>
      </div>`);
    if (open) requestAnimationFrame(() => { const m = this.$('[data-min]'); m.focus(); m.select(); });
  }

  teardown() {
    clearInterval(this.timer);
  }

  // The compact width: the same 14px padding (+ border) on both sides of the
  // wider of the widest time in the current format ("00:00" / "12:00 PM",
  // tabular digits, so minutes never move it) and today's date line. The date
  // decides, and it only changes at midnight; sizing for the widest date of
  // the year ("dom, 08 de mar") would leave up to 8px of extra room on the right.
  measure(format, date) {
    const key = format + locale() + date;
    if (key === this.measured) return;
    this.measured = key;
    const ctx = (this.ctx ??= document.createElement('canvas').getContext('2d'));
    const width = (font, text, spacing = 0) => { ctx.font = font; return ctx.measureText(text).width + spacing * text.length; };
    ctx.fontVariantNumeric = 'tabular-nums';
    const times = format === '12h' ? ['12:00 AM', '12:00 PM'] : ['00:00'];
    const time = Math.max(...times.map(s => width('600 20px Inter', s, -0.4)));
    ctx.fontVariantNumeric = 'normal';
    // the date's ink: the gap on the right matches the visible one on the left
    ctx.font = '500 11px Inter';
    const m = ctx.measureText(date);
    const day = m.actualBoundingBoxRight;
    this.style.setProperty('--clock-w', `${Math.round(Math.max(time, day)) + 14 * 2 + 2}px`);
  }

  update({ ui, agenda }) {
    this.format = ui.clockFormat;
    const shown = this.$('[data-date]').textContent;
    this.measure(ui.clockFormat, shown[0]?.toUpperCase() + shown.slice(1));  // ::first-letter capitalizes it
    this.toggleAttribute('data-open', ui.popover === 'calendar');

    this.renderTimerMenu(ui);

    // what's next matters more than what's running: warn first
    const event = agenda.upcoming ?? agenda.ongoing;
    // a timer takes the second line when no event does
    this.timing = !event && !!ui.timer;
    this.classList.toggle('reminding', !!event || this.timing);
    this.toggleAttribute('data-tip', !!event || this.timing);
    this.style.removeProperty('--status');
    if (this.timing) {
      this.dataset.status = 'timer';
      this.style.setProperty('--status', ui.timer.color);
      this.classList.remove('has-meet');
      setHTML(this.$('.cat'), icon('timer'));
      this.showTimer(ui.timer);
      this.$(':scope > .label').textContent = `${ui.timer.label || t('timer.title')} · ${t('timer.ends', { time: formatTime(new Date(ui.timer.end)) })}`;
      return;
    }
    this.$('.rtext').classList.remove('tnum');
    if (!event) { delete this.dataset.status; this.classList.remove('has-meet'); return; }

    this.dataset.status = agenda.upcoming ? 'warn' : 'ok';
    const title = event.title || t('calendar.untitled');
    setHTML(this.$('.cat'), icon(categories[event.category]?.icon ?? 'user'));
    this.$('.rtext').textContent = title;
    const when = agenda.upcoming ? t('reminder.soon', { minutes: agenda.minutes }) : t('reminder.now');
    this.$(':scope > .label').textContent = `${title} · ${formatTime(event.start)}–${formatTime(event.end)} · ${when}`
      + (event.meet ? ` · ${t('reminder.join')}` : '');
    this.classList.toggle('has-meet', !!event.meet);
  }

  // "4:05 · Pasta" on the second line, and in the open popover
  showTimer(timer) {
    const left = remainingText(timer);
    this.$('.rtext').textContent = left + (timer.label ? ` · ${timer.label}` : '');
    this.$('.rtext').classList.add('tnum');
    const shown = this.$('[data-left]');
    if (shown) shown.textContent = left;
  }

  tick() {
    checkTimer();
    const timer = store.get().ui.timer;
    if (timer) this.showTimer(timer);
    const d = new Date();
    this.$('[data-time]').textContent = formatTime(d);
    // "Sexta 09/10/26" / "Friday 10/09/26": the full weekday without "-feira"
    const weekday = dateFormat({ weekday: 'long' }).format(d).replace('-feira', '');
    const date = `${weekday} ${dateFormat({ day: '2-digit', month: '2-digit', year: '2-digit' }).format(d)}`;
    this.$('[data-date]').textContent = date;
    this.measure(this.format ?? '24h', date[0].toUpperCase() + date.slice(1));
    // the reminder's mini date: "Sex 09/10" / "Fri 10/09"
    this.$('[data-mini]').textContent = `${dateFormat({ weekday: 'short' }).format(d).replace(/\./g, '')} ${dateFormat({ day: '2-digit', month: '2-digit' }).format(d)}`;
  }
}

define('ss-clock', Clock);
