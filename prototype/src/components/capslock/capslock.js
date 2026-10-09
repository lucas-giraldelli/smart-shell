import { Component, define } from '../../core/component.js';
import { icon } from '../../core/icons.js';
import { toggleCapsLock } from '../../services/keyboard.js';
import { t } from '../../i18n/index.js';

// Caps Lock indicator for keyboards without an LED: always visible, white when
// off and the theme's ok-green when on. While Hyprland's resize submap is on
// (Alt+R) a resize indicator shows to its right, in the same style.
class CapsLock extends Component {
  static slices = ['keyboard'];

  render() {
    return `${icon('arrow-big-up-dash')}<span class="label"></span>
      <span class="resize" data-tip>${icon('scaling')}<span class="label">${t('keyboard.resize')}</span></span>`;
  }

  setup() {
    this.classList.add('caps');
    this.dataset.tip = '';
    // prototype only: lets you preview the "on" state without the key
    this.addEventListener('click', toggleCapsLock);
  }

  update({ keyboard }) {
    const on = keyboard.capsLock;
    this.classList.toggle('on', on);
    this.dataset.status = on ? 'ok' : 'off';
    this.$(':scope > .label').textContent = t(on ? 'capslock.on' : 'capslock.off');
    this.classList.toggle('resizing', keyboard.submap === 'resize');
  }
}

define('ss-capslock', CapsLock);
