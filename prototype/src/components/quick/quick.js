import { Component, define } from '../../core/component.js';
import { icon } from '../../core/icons.js';
import { config } from '../../data/config.js';
import { isOpen, openPopover, closePopover, cameFrom, pathFind } from '../../core/popover.js';
import { store } from '../../state.js';
import { configuredPanes } from '../control-center/panes/index.js';
import { setHTML } from '../ui/ui.js';
import '../control-center/control-center.js';

// Compact grid of quick items (one per pane). Any click on the tile opens the
// control center on the tab of the item under the cursor; scroll adjusts it.
class Quick extends Component {
  setup() {
    this.classList.add('tile', 'quick');
    this.dataset.popover = 'control-center';
    const open = e => {
      if (cameFrom(e, 'ss-control-center')) return;
      e.preventDefault();
      const tab = pathFind(e, '[data-item]')?.dataset.item ?? store.get().ui.ccTab;
      if (isOpen('control-center') && store.get().ui.ccTab === tab) closePopover();
      else openPopover('control-center', { ccTab: tab });
    };
    this.addEventListener('click', open);
    this.addEventListener('contextmenu', open);
    this.addEventListener('wheel', e => {
      const id = e.target.closest('[data-item]')?.dataset.item;
      const item = this.items.find(i => i.pane.id === id);
      if (!item?.available || !item.pane.wheel) return;
      const pane = item.pane;
      e.preventDefault();
      pane.wheel(e.deltaY < 0 ? 1 : -1);
    }, { passive: false });
  }

  build(caps) {
    this.items = configuredPanes(config.quick, caps);
    this.innerHTML = this.items.map(({ pane }) =>
      `<div class="q" data-item="${pane.id}" title="${pane.label}" style="--qw: ${pane.quickWidth ?? '4ch'}"></div>`).join('')
      + '<ss-control-center></ss-control-center>';
    this.style.gridTemplateRows = `repeat(${Math.min(2, this.items.length)}, auto)`;
  }

  update(state) {
    const capsKey = JSON.stringify(state.caps);
    if (capsKey !== this.capsKey) { this.capsKey = capsKey; this.build(state.caps); }
    this.toggleAttribute('data-open', state.ui.popover === 'control-center');
    for (const { pane, available } of this.items) {
      // a missing backend keeps its slot, greyed out with a dash
      const { icon: name, text, tone = '', status } = available ? pane.quick(state) : { icon: pane.icon, text: '—', tone: 'disabled' };
      const el = this.querySelector(`[data-item="${pane.id}"]`);
      setHTML(el, icon(name) + `<span>${text}</span>`);
      el.className = `q ${tone}`;
      if (status) el.dataset.status = status; else delete el.dataset.status;
    }
  }
}

define('ss-quick', Quick);
