import { Component, define } from '../../core/component.js';
import { appIcon } from '../../core/icons.js';
import { tray } from '../../data/snapshot.js';

// System tray (StatusNotifierItem in the real shell). An item that needs
// attention (SNI NeedsAttention, or Slack's red mention badge) bounces once
// right away, then again every 8 s until it's dealt with (every 2 s for
// Slack's red badge).
class Tray extends Component {
  static slices = ['tray'];

  render() {
    return tray.map(name => `<img src="${appIcon(name)}" alt="${name}" title="${name}" data-item="${name}">`).join('');
  }

  setup() {
    this.classList.add('tile', 'tray');
  }

  update({ tray: t }) {
    this.querySelectorAll('[data-item]').forEach(img => {
      img.classList.toggle('attention', t.attention.includes(img.dataset.item));
      img.classList.toggle('mention', img.dataset.item === 'slack' && t.attention.includes('slack'));
    });
  }
}

define('ss-tray', Tray);
