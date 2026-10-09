import { Component, define } from '../../core/component.js';
import { icon } from '../../core/icons.js';
import { config } from '../../data/config.js';
import { store, update } from '../../state.js';
import { configuredPanes } from './panes/index.js';
import { missingText, installHint } from '../../data/capabilities.js';
import { t } from '../../i18n/index.js';

// Tabbed popover hosting one pane per quick item. Lives inside <ss-quick>,
// which decides when it is open.
class ControlCenter extends Component {
  setup() {
    this.classList.add('menu', 'cc');
    this.addEventListener('click', e => {
      const tab = e.target.closest('[data-tab]');
      if (tab) return update('ui', { ccTab: tab.dataset.tab });
      if (this.available.has(this.active?.id)) this.active.click?.(e.target, this.paneEl(this.active.id));
    });
    this.addEventListener('input', e => {
      const key = e.target.dataset.range;
      if (key && this.available.has(this.active?.id)) this.active.input?.(key, +e.target.value);
    });
  }

  paneEl(id) {
    return this.querySelector(`[data-pane="${id}"]`);
  }

  build(caps) {
    const items = configuredPanes(config.quick, caps);
    this.panes = items.map(i => i.pane);
    this.available = new Set(items.filter(i => i.available).map(i => i.pane.id));
    this.innerHTML = `
      <div class="tabs">${items.map(({ pane: p, available }) =>
        `<button data-tab="${p.id}"${available ? '' : ' class="disabled"'}>${icon(p.icon)}${p.label}</button>`).join('')}</div>
      ${items.map(({ pane: p, available }) =>
        `<div class="pane" data-pane="${p.id}">${available ? p.render() : this.missing(p)}</div>`).join('')}`;
  }

  // a tab whose backend is missing says what to install instead of its controls
  missing(pane) {
    const hint = installHint(pane.requires);
    return `<div class="missing">${icon(pane.icon)}<b>${missingText(pane.requires)}</b>
      ${hint ? `<span class="meta">${t('capabilities.install', { pkg: `<code>${hint}</code>` })}</span>` : ''}</div>`;
  }

  update(state) {
    const { ui, caps } = state;
    const capsKey = JSON.stringify(caps);
    if (capsKey !== this.capsKey) { this.capsKey = capsKey; this.build(caps); }
    if (ui.popover !== 'control-center') return;

    this.active = this.panes.find(p => p.id === ui.ccTab) ?? this.panes[0];
    this.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === this.active.id));
    this.querySelectorAll('[data-pane]').forEach(p => p.classList.toggle('on', p.dataset.pane === this.active.id));
    if (this.available.has(this.active.id)) this.active.update(this.paneEl(this.active.id), state);
  }
}

define('ss-control-center', ControlCenter);
