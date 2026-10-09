import { Component, define } from '../../core/component.js';
import { icon } from '../../core/icons.js';
import { store, update } from '../../state.js';
import { t } from '../../i18n/index.js';
import { config } from '../../data/config.js';

const isMusicApp = media => (config.pets?.danceWith ?? [])
  .some(w => `${media.url ?? ''} ${media.source ?? ''}`.toLowerCase().includes(w.toLowerCase()));
import { isOpen, openPopover, closePopover, cameFrom } from '../../core/popover.js';
import { slider, setSlider, setHTML } from '../ui/ui.js';

// Now playing (MPRIS in the real shell). Click toggles play/pause; hovering
// shows the full title and artist; the tile itself names only the
// artist (or the album).
class Music extends Component {
  static slices = ['media', 'ui'];

  render() {
    const m = store.get().media;
    return `
      <div class="art">${icon('music')}</div>
      <div class="meta-col">
        <div class="title">${m.title}</div>
        <div class="t-sub">${m.artist || m.album || ''}</div>
        <div class="progress"><i></i></div>
      </div>
      <div class="eq"><i></i><i></i><i></i><i></i></div>
      <span class="label"></span>
      <div class="menu music-volume">
        <div class="sec">${t('music.volume')}</div>
        ${slider({ key: 'ytm', label: 'YouTube Music', iconName: 'volume-2', button: true })}
      </div>`;
  }

  setup() {
    this.classList.add('tile', 'music');
    this.dataset.tip = '';
    this.dataset.popover = 'music-volume';
    this.addEventListener('click', e => {
      if (cameFrom(e, '.menu')) {
        // the mute button
        if (e.target.closest('[data-btn="ytm"]')) update('media', m => ({ muted: !m.muted }));
        return;
      }
      closePopover();
      update('media', m => ({ playing: !m.playing }));
    });
    // right click: the YouTube Music app's own volume (its PipeWire stream in the shell)
    // (only for the YouTube Music app - config.pets.danceWith; any other player: nothing)
    this.addEventListener('contextmenu', e => {
      e.preventDefault();
      if (!isMusicApp(store.get().media)) return;
      isOpen('music-volume') ? closePopover() : openPopover('music-volume');
    });
    this.addEventListener('input', e => {
      if (e.target.dataset.range === 'ytm') update('media', { volume: +e.target.value, muted: false });
    });
  }

  update({ media, ui }) {
    this.toggleAttribute('data-open', ui.popover === 'music-volume');
    setSlider(this, 'ytm', media.volume, media.muted ? t('common.muted') : media.volume + '%');
    const mute = this.$('[data-btn="ytm"]');
    setHTML(mute, icon(media.muted ? 'volume-x' : 'volume-2'));
    mute.classList.toggle('off', media.muted);
    this.classList.toggle('playing', media.playing);
    // title and artist are cut short in the tile: the tooltip has them in full
    // (no player name: it's only ever "Chromium" / "Mozilla Zen")
    this.$('.label').textContent = [media.title, media.artist].filter(Boolean).join(' · ');
    this.$('.progress i').style.width = (media.progress * 100).toFixed(1) + '%';
  }
}

define('ss-music', Music);
