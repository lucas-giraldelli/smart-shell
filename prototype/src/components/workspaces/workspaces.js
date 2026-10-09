import { Component, define } from '../../core/component.js';
import { icon } from '../../core/icons.js';
import { update } from '../../state.js';

// Workspace switcher. The active workspace is a pill; with `wsIcons` on, the
// other occupied ones become small dots holding their icon (+ window count).
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
    this.classList.toggle('icons', ui.wsIcons);
    // rebuild only when the list changes; switching just moves the `on` class
    if (this.list !== workspaces.list) {
      this.list = workspaces.list;
      this.innerHTML = workspaces.list.map(ws => {
        const n = ws.windows.length;
        return `<button data-id="${ws.id}" data-tip class="${n ? 'has' : ''}">
          ${n ? icon(ws.icon, 'g') : ''}${n > 1 ? `<span class="n">${n}</span>` : ''}
          <span class="label">Workspace ${ws.id} · ${ws.windows.join(', ') || 'vazio'}</span>
        </button>`;
      }).join('');
    }
    for (const b of this.children) b.classList.toggle('on', +b.dataset.id === workspaces.active);
  }
}

define('ss-workspaces', Workspaces);
