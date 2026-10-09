import { Component, define } from '../../core/component.js';
import { isOpen, openPopover, closePopover, cameFrom } from '../../core/popover.js';
import './calendar.js';

const TIME = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const SOON_MIN = 2; // the dot starts pulsing this close to the start

// Time and date. The date line slides away to a subtle reminder while an event
// is about to start or in progress. Click opens the month calendar.
class Clock extends Component {
  static slices = ['ui', 'agenda', 'events'];

  render() {
    return `
      <div class="t-big" data-time></div>
      <div class="sub-line"><div class="ticker">
        <div class="t-sub" data-date></div>
        <div class="t-sub remind"><span class="rdot"></span><span class="rtext"></span></div>
      </div></div>
      <span class="label"></span>
      <ss-calendar></ss-calendar>`;
  }

  setup() {
    this.classList.add('tile', 'clock');
    this.dataset.popover = 'calendar';
    this.addEventListener('click', e => {
      if (cameFrom(e, 'ss-calendar')) return;
      isOpen('calendar') ? closePopover() : openPopover('calendar');
    });
    this.tick();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  teardown() {
    clearInterval(this.timer);
  }

  update({ ui, agenda, events }) {
    this.toggleAttribute('data-open', ui.popover === 'calendar');

    const event = agenda.ongoing ?? agenda.upcoming;
    this.classList.toggle('reminding', !!event);
    this.classList.toggle('soon', !agenda.ongoing && agenda.minutes !== null && agenda.minutes <= SOON_MIN);
    this.toggleAttribute('data-tip', !!event);
    if (!event) return;

    const when = agenda.ongoing ? 'agora' : `em ${agenda.minutes} min`;
    this.$('.rtext').textContent = `${when} · ${event.title}`;
    this.$('.rdot').style.background = events.calendars[event.calendars[0]] ?? 'var(--accent)';
    this.$('.label').textContent = `${event.title} · ${TIME.format(event.start)}–${TIME.format(event.end)}`;
  }

  tick() {
    const d = new Date();
    this.$('[data-time]').textContent = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    this.$('[data-date]').textContent = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).replace(/\./g, '');
  }
}

define('ss-clock', Clock);
