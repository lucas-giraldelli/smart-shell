import { Component, define } from '../../core/component.js';
import { icon } from '../../core/icons.js';
import { update } from '../../state.js';
import { t } from '../../i18n/index.js';

// Workspace switcher. The active workspace is a pill; how the other occupied
// ones look follows `wsStyle`: small dots holding their icon ('icons'), their
// number ('numbers') - the pill shows its number too - or plain dots ('dots').
// The windows are listed in the tooltip.
class Workspaces extends Component {
  static slices = ['workspaces', 'ui'];

  setup() {
    this.classList.add('ws');
    this.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (b) update('workspaces', { active: +b.dataset.id });
    });
  }

  update({ workspaces, ui }) {
    this.classList.toggle('icons', ui.wsStyle === 'icons');
    this.classList.toggle('numbers', ui.wsStyle === 'numbers');
    // rebuild only when the list changes; switching just moves the `on` class
    if (this.list !== workspaces.list) {
      this.list = workspaces.list;
      this.innerHTML = workspaces.list.map(ws => {
        const n = ws.windows.length;
        return `<button data-id="${ws.id}" data-tip class="${n ? 'has' : ''}">
          ${n ? icon(ws.icon, 'g') : ''}<span class="num">${ws.id}</span>
          <span class="label">${t('workspaces.label', { id: ws.id, windows: ws.windows.join(', ') || t('workspaces.empty') })}</span>
        </button>`;
      }).join('');
    }
    for (const b of this.children) b.classList.toggle('on', +b.dataset.id === workspaces.active);
  }
}

define('ss-workspaces', Workspaces);
