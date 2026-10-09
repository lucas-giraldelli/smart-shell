import { Component, define } from '../../core/component.js';
import { icon } from '../../core/icons.js';
import { toggleCapsLock } from '../../services/keyboard.js';

// Caps Lock indicator for keyboards without an LED: a quiet icon when off,
// a glowing "CAPS" pill when on.
class CapsLock extends Component {
  static slices = ['keyboard'];

  render() {
    return `${icon('arrow-big-up-dash')}<span class="caps-text">CAPS</span><span class="label"></span>`;
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
    this.$('.label').textContent = on ? 'Caps Lock ligado' : 'Caps Lock desligado';
  }
}

define('ss-capslock', CapsLock);
