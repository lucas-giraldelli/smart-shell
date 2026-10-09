import { Component, define } from '../../core/component.js';
import { icon } from '../../core/icons.js';
import { store, update } from '../../state.js';

// Now playing (MPRIS in the real shell). Click toggles play/pause; hovering
// shows the full title, artist and player.
class Music extends Component {
  static slices = ['media'];

  render() {
    const m = store.get().media;
    return `
      <div class="art">${icon('music')}</div>
      <div class="meta-col">
        <div class="title">${m.title}</div>
        <div class="t-sub">${m.artist} · ${m.source}</div>
        <div class="progress"><i></i></div>
      </div>
      <div class="eq"><i></i><i></i><i></i><i></i></div>
      <span class="label"></span>`;
  }

  setup() {
    this.classList.add('tile', 'music');
    this.dataset.tip = '';
    this.addEventListener('click', () => update('media', m => ({ playing: !m.playing })));
  }

  update({ media }) {
    this.classList.toggle('playing', media.playing);
    // title and artist are cut short in the tile: the tooltip has them in full
    this.$('.label').textContent = [media.title, media.artist, media.source].filter(Boolean).join(' · ');
    this.$('.progress i').style.width = (media.progress * 100).toFixed(1) + '%';
  }
}

define('ss-music', Music);
