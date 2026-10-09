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
      const item = this.items.find(it => it.pane.id === id);
      if (!item?.available || !item.pane.wheel) return;
      const pane = item.pane;
      e.preventDefault();
      pane.wheel(e.deltaY < 0 ? 1 : -1);
    }, { passive: false });
  }

  build(caps, state) {
    this.items = configuredPanes(config.quick, caps);
    // one slot per mini item: a pane may contribute several
    this.slots = this.items.flatMap(({ pane, available }) => {
      const out = available ? pane.quick(state) : null;
      const count = Array.isArray(out) ? out.length : 1;
      return Array.from({ length: count }, (_, i) => ({ pane, available, i }));
    });
    this.innerHTML = this.slots.map(({ pane, i }) =>
      `<div class="q" data-item="${pane.id}" data-slot="${i}" title="${pane.label}" style="--qw: ${pane.quickWidth ?? '4ch'}"></div>`).join('')
      + '<ss-control-center></ss-control-center>';
    this.style.gridTemplateRows = `repeat(${Math.min(2, this.slots.length)}, auto)`;
  }

  update(state) {
    const capsKey = JSON.stringify(state.caps);
    if (capsKey !== this.capsKey) { this.capsKey = capsKey; this.build(state.caps, state); }
    this.toggleAttribute('data-open', state.ui.popover === 'control-center');
    for (const { pane, available, i } of this.slots) {
      // a missing backend keeps its slot, greyed out with a dash
      const out = available ? pane.quick(state) : { icon: pane.icon, text: '—', tone: 'disabled' };
      const { icon: name, text, tone = '', status, width } = Array.isArray(out) ? out[i] : out;
      const el = this.querySelector(`[data-item="${pane.id}"][data-slot="${i}"]`);
      setHTML(el, icon(name) + `<span>${text}</span>`);
      el.className = `q ${tone}`;
      if (width) el.style.setProperty('--qw', width);
      if (status) el.dataset.status = status; else delete el.dataset.status;
    }
  }
}

define('ss-quick', Quick);
