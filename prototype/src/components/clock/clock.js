import { Component, define } from '../../core/component.js';
import { icon } from '../../core/icons.js';
import { isOpen, openPopover, closePopover, cameFrom } from '../../core/popover.js';
import { categories } from '../../data/categories.js';
import { t, dateFormat, formatTime, locale } from '../../i18n/index.js';
import { setHTML } from '../ui/ui.js';
import './calendar.js';

// Time and date. Shortly before an event (config.events.remindMinutes) the tile
// turns orange (warn); while an event runs it turns green (ok). Either way the
// date moves up next to the time and the event's name, with its category icon,
// takes the second line. Click opens the month calendar.
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
      <ss-calendar></ss-calendar>`;
  }

  setup() {
    this.classList.add('tile', 'clock');
    this.dataset.popover = 'calendar';
    this.addEventListener('click', e => {
      if (cameFrom(e, 'ss-calendar')) return;
      // the reminder's video icon joins the Meet; the rest opens the calendar
      const event = store.get().agenda.upcoming ?? store.get().agenda.ongoing;
      if (event?.meet && e.target.closest('.meet-ic')) { window.open(event.meet, '_blank'); return; }
      isOpen('calendar') ? closePopover() : openPopover('calendar');
    });
    this.tick();
    this.timer = setInterval(() => this.tick(), 1000);
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

    // what's next matters more than what's running: warn first
    const event = agenda.upcoming ?? agenda.ongoing;
    this.classList.toggle('reminding', !!event);
    this.toggleAttribute('data-tip', !!event);
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

  tick() {
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
