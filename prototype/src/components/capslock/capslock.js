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
      <span class="resize" data-tip>${icon('scaling')}<span class="label">${t('keyboard.resize')}</span></span>
      <span class="rec" data-tip><i></i><b data-rec-time>0:00</b><span class="label">${t('keyboard.recording')}</span></span>`;
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
    // recording: a red dot and the elapsed time (click stops it in the shell)
    if (!!keyboard.recording !== this.classList.contains('recording')) {
      this.classList.toggle('recording', !!keyboard.recording);
      clearInterval(this.recTimer);
      if (keyboard.recording) {
        const since = Date.now();
        const tick = () => { const s = Math.round((Date.now() - since) / 1000); this.$('[data-rec-time]').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
        tick();
        this.recTimer = setInterval(tick, 1000);
      }
    }
  }
}

define('ss-capslock', CapsLock);
