import { Component, define } from '../../core/component.js';
import { icon } from '../../core/icons.js';
import { isOpen, openPopover, closePopover, cameFrom } from '../../core/popover.js';
import { setHTML } from '../ui/ui.js';
import { t } from '../../i18n/index.js';
import { store, update as updateStore } from '../../state.js';
import { statusOf, worst, sorted, size, speed, percent, title, seedDays, owed, stopped } from '../../data/torrents.js';
import { config } from '../../data/config.js';

// The torrents of a qBittorrent Web UI (the shell reads its API every 60 s,
// every 5 s while the list is open), as an item of the tray: the download
// icon while anything downloads, else the upload one, in the worst state's
// colour (red while a service is down). Click lists a dot per service in
// config.torrents.services and the VPN (red when down, a click opens it), then
// the torrents: title ("Coraline (2009)", "Loki · S02", the release name on
// hover), size, progress, state (seeding: its days, yellow while still owed
// to the tracker, config.torrents.seedDays) and the seeds in its swarm. The
// square at a row's end stops seeding it (asking twice while owed), the play
// brings it back; the rest of the row opens the Web UI.
export const LOOK = {
  error: { icon: 'circle-alert', color: 'var(--crit)' },
  stalled: { icon: 'triangle-alert', color: 'var(--warn)' },
  downloading: { icon: 'download', color: 'var(--menu-accent)' },
  checking: { icon: 'refresh-cw', color: 'var(--menu-sub)' },
  queued: { icon: 'clock', color: 'var(--menu-sub)' },
  paused: { icon: 'circle-pause', color: 'var(--menu-sub)' },
  seeding: { icon: 'upload', color: 'var(--ok)' },
};
const ACTIVE = ['downloading', 'stalled', 'queued', 'checking'];

class TorrentList extends Component {
  static slices = ['torrents', 'ui'];

  setup() {
    this.classList.add('menu', 'torrents-menu');
    this.addEventListener('click', e => {
      if (e.target.closest('[data-refresh]')) {
        // the API in the real shell; here, just the timestamp
        updateStore('torrents', { loading: true });
        setTimeout(() => updateStore('torrents', { loading: false }), 700);
        return;
      }
      const service = e.target.closest('[data-service]');
      if (service) { window.open(service.dataset.service, '_blank'); closePopover(); return; }
      const act = e.target.closest('[data-act]');
      if (act) {
        const hash = act.closest('[data-row]').dataset.row;
        const tr = store.get().torrents.list.find(x => x.hash === hash);
        // stop while owed: the first click arms it (red), the second stops
        if (act.dataset.act === 'stop' && owed(tr, config.torrents.seedDays) && !act.classList.contains('off')) {
          act.classList.add('off');
          setTimeout(() => act.classList.remove('off'), 3000);
          return;
        }
        // POST /api/v2/torrents/stop|start in the real shell
        const state = act.dataset.act === 'stop' ? (tr.progress < 1 ? 'stoppedDL' : 'stoppedUP') : (tr.progress < 1 ? 'downloading' : 'stalledUP');
        updateStore('torrents', s => ({ list: s.list.map(x => (x.hash === hash ? { ...x, state } : x)) }));
        return;
      }
      // the Web UI (xdg-open in the real shell)
      if (e.target.closest('[data-row]')) { window.open('http://localhost:8081', '_blank'); closePopover(); }
    });
  }

  update({ torrents, ui }) {
    if (ui.popover !== 'torrents') return;
    const rows = sorted(torrents.list);
    setHTML(this, `
      <div class="tr-head">
        <span class="sec">${t('torrents.title')}</span>
        <span class="meta">↓ ${speed(torrents.dlspeed)}  ↑ ${speed(torrents.upspeed)}</span>
        <button class="ib${torrents.loading ? ' spinning' : ''}" data-refresh title="${t('torrents.refresh')}">${icon('refresh-cw')}</button>
      </div>
      ${torrents.services.length ? `<div class="tr-services">${[...torrents.services, { name: 'VPN', url: '', up: torrents.vpn }].map(s =>
        `<span class="tr-service${s.up ? '' : ' down'}"${s.url ? ` data-service="${s.url}"` : ''}><i></i>${s.name}</span>`).join('')}</div>` : ''}
      ${rows.length ? `
      <div class="tr-cols"><span class="grow">${t('torrents.name')}</span><span>${t('torrents.size')}</span><span>${t('torrents.progress')}</span><span>${t('torrents.status')}</span><span>${t('torrents.seeds')}</span><span></span></div>
      <div class="tr-list">${rows.map(tr => {
        const s = statusOf(tr), l = LOOK[s];
        const state = s === 'seeding' ? (owed(tr, config.torrents.seedDays) ? 'owed' : 'paid') : s;
        const action = stopped(tr) ? 'start' : s === 'seeding' ? 'stop' : '';
        return `<div class="row tr" data-row="${tr.hash}" title=""${tr.name} · ${t('torrents.tip', { seeds: tr.num_seeds, swarm: tr.num_complete })}">
          <span class="tr-ic" style="color:${l.color}">${icon(l.icon)}</span>
          <span class="grow tr-name">${title(tr.name)}</span>
          <span>${size(tr.size)}</span>
          <span>${percent(tr.progress)}</span>
          <span class="tr-state" data-state="${state}">${t(`torrents.states.${s}`)}${s === 'seeding' ? ` · ${seedDays(tr)}d` : ''}</span>
          <span>${tr.num_complete}</span>
          ${action ? `<button class="ib flat tr-act" data-act="${action}">${icon(action === 'stop' ? 'square' : 'play')}</button>` : '<span></span>'}
        </div>`;
      }).join('')}</div>` : `<div class="meta tr-empty">${t('torrents.none')}</div>`}`);
  }
}
define('ss-torrent-list', TorrentList);

class Torrents extends Component {
  static slices = ['torrents', 'ui'];

  render() {
    return `<span data-icon></span><ss-torrent-list></ss-torrent-list>`;
  }

  setup() {
    this.classList.add('torrents');
    this.dataset.popover = 'torrents';
    this.addEventListener('click', e => {
      if (cameFrom(e, 'ss-torrent-list')) return;
      isOpen('torrents') ? closePopover() : openPopover('torrents');
    });
  }

  update({ torrents, ui }) {
    const w = worst(torrents.list);
    const downloading = torrents.list.some(tr => ACTIVE.includes(statusOf(tr)) && tr.progress < 1);
    setHTML(this.$('[data-icon]'), icon(downloading ? 'download' : 'upload'));
    this.toggleAttribute('data-open', ui.popover === 'torrents');
    const down = torrents.services.filter(s => !s.up).map(s => s.name).concat(torrents.vpn ? [] : ['VPN']);
    this.style.setProperty('--tr', down.length ? 'var(--crit)' : w ? LOOK[w].color : 'var(--menu-sub)');
    this.title = t('torrents.tile', { n: torrents.list.length }) + (down.length ? ` · ${t('torrents.down', { names: down.join(', ') })}` : '');
  }
}
define('ss-torrents', Torrents);
