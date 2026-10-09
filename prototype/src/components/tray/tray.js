import { Component, define } from '../../core/component.js';
import { appIcon } from '../../core/icons.js';
import { tray } from '../../data/snapshot.js';

// System tray (StatusNotifierItem in the real shell).
class Tray extends Component {
  render() {
    return tray.map(name => `<img src="${appIcon(name)}" alt="${name}" title="${name}">`).join('');
  }

  setup() {
    this.classList.add('tile', 'tray');
  }
}

define('ss-tray', Tray);
