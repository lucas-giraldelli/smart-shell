import { Component, define } from '../../core/component.js';
import { appIcon } from '../../core/icons.js';
import { tray } from '../../data/snapshot.js';
import { config } from '../../data/config.js';
import { store } from '../../state.js';
import '../prs/prs.js';

// System tray (StatusNotifierItem in the real shell). An item that needs
// attention (SNI NeedsAttention, or Slack's red mention badge) bounces once
// right away, then again every 8 s until it's dealt with (every 2 s for
// Slack's red badge).
class Tray extends Component {
  static slices = ['tray', 'ui'];

  // the pull requests ride in the tray as one more item (the `prs` widget)
  get withPrs() {
    return config.dock.some(g => g.widgets.includes('prs')) && !store.get().ui.hidden.includes('prs');
  }

  render() {
    return tray.map(name => `<img src="${appIcon(name)}" alt="${name}" title="${name}" data-item="${name}">`).join('')
      + (this.withPrs ? '<ss-prs></ss-prs>' : '');
  }

  setup() {
    this.classList.add('tile', 'tray');
  }

  update({ tray: t, ui }) {
    // as many rows of 16px icons as the dock's height fits (two at 52px, one
    // at 42px), the rest in columns - at least two
    const cells = this.querySelectorAll('[data-item], ss-prs').length;
    const maxRows = Math.max(1, Math.floor((ui.size - 2 - 14 + 4) / 20));
    this.style.gridTemplateColumns = `repeat(${cells <= 1 ? 1 : Math.max(2, Math.ceil(cells / maxRows))}, 1fr)`;
    this.toggleAttribute('data-single', this.querySelectorAll('[data-item], ss-prs').length === 1);
    this.querySelectorAll('[data-item]').forEach(img => {
      img.classList.toggle('attention', t.attention.includes(img.dataset.item));
      img.classList.toggle('mention', img.dataset.item === 'slack' && t.attention.includes('slack'));
    });
  }
}

define('ss-tray', Tray);
