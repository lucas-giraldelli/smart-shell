import { Component, define } from '../../core/component.js';
import { icon } from '../../core/icons.js';
import { toggleCapsLock } from '../../services/keyboard.js';
import { t } from '../../i18n/index.js';

// Caps Lock indicator for keyboards without an LED: always visible, white when
// off and the theme's ok-green when on.
class CapsLock extends Component {
  static slices = ['keyboard'];

  render() {
    return `${icon('arrow-big-up-dash')}<span class="label"></span>`;
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
    this.$('.label').textContent = t(on ? 'capslock.on' : 'capslock.off');
  }
}

define('ss-capslock', CapsLock);
