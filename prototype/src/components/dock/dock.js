import { Component, define } from '../../core/component.js';
import { config } from '../../data/config.js';
import { widgets, available } from '../registry.js';
import { missingText } from '../../data/capabilities.js';

// The dock bar. Its content is built from config.dock: groups of widgets with a
// separator between the non-empty ones. Hidden widgets (ui.hidden) are skipped;
// widgets whose capability is missing get [data-unavailable] and render disabled.
class Dock extends Component {
  static slices = ['ui', 'caps'];

  setup() {
    this.classList.add('dock');
  }

  update({ ui, caps }) {
    document.documentElement.style.setProperty('--size', ui.size + 'px');
    const key = ui.hidden.join() + JSON.stringify(caps);
    if (key === this.hiddenKey) return;
    this.hiddenKey = key;

    const groups = config.dock
      .map(g => ({ ...g, widgets: g.widgets.filter(id => widgets[id] && !ui.hidden.includes(id)) }))
      .filter(g => g.widgets.length);
    this.innerHTML = groups.map(g => {
      const items = g.widgets.map(id => {
        const w = widgets[id];
        const off = available(w, caps) ? '' : ` data-unavailable="${missingText(w.requires)}"`;
        return `<${w.tag}${off}></${w.tag}>`;
      }).join('');
      return g.tiles ? `<div class="tiles">${items}</div>` : items;
    }).join('<div class="sep"></div>')
      // themed decoration (see styles/themes/snowy.css); a real node so it can be inspected
      + '<div class="snow-cap" data-testid="snow-cap" aria-hidden="true"></div>'
      + '<div class="snow-spill" data-testid="snow-spill" aria-hidden="true"></div>';
  }
}

define('ss-dock', Dock);
