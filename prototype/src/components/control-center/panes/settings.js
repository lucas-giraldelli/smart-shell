import { icon } from '../../../core/icons.js';
import { savePref } from '../../../core/prefs.js';
import { store, update } from '../../../state.js';
import { themes } from '../../../data/themes.js';
import { widgets } from '../../registry.js';
import { species } from '../../pets/pets.js';
import { slider, setSlider, row, toggle, setHTML } from '../../ui/ui.js';
import { t, locale, locales } from '../../../i18n/index.js';

// The dock's own settings: look, which widgets and pets show, language.
// A tab only - it adds nothing to the quick tile. Real shell: saved to the
// shell's state file. The quick tile can't be switched off here, since that
// would hide this very tab.
const TOGGLEABLE = Object.keys(widgets).filter(id => id !== 'quick');
const check = on => `<span class="chk${on ? ' on' : ''}">${icon('check')}</span>`;
const radio = on => `<span class="radio-dot${on ? ' on' : ''}"></span>`;

export default {
  id: 'settings',
  get label() { return t('settings.label'); },
  icon: 'sliders-horizontal',

  render: () => `
    <div class="set">
      <div class="sec">${t('settings.look')}</div>
      <div class="themes">${themes.map(th => `
        <button data-theme-id="${th.id}" title="${t(`themes.${th.id}`)}">
          <span class="sw" style="background:${th.swatch}"></span><span>${t(`themes.${th.id}`)}</span>
        </button>`).join('')}
      </div>
      ${slider({ key: 'size', label: t('settings.size'), iconName: 'sliders-horizontal', min: 40, max: 72 })}
      ${slider({ key: 'magnify', label: t('settings.magnify'), iconName: 'sliders-horizontal', min: 100, max: 220 })}
      <div data-ws-icons></div>

      <div class="sec">${t('settings.widgets')}</div>
      <div class="checks">${TOGGLEABLE.map(id => `<label class="check-row" data-widget="${id}"><span data-box></span>${t(`widgets.${id}`)}</label>`).join('')}</div>

      <div class="sec">${t('settings.pets')}</div>
      <div class="checks">${[...Object.keys(species), 'none'].map(k => `<label class="check-row" data-pet="${k}"><span data-box></span>${t(k === 'none' ? 'settings.noPet' : `pets.names.${k}`)}</label>`).join('')}</div>

      <div class="sec">${t('settings.language')}</div>
      <div class="langs">${locales().map(l => `<button data-locale="${l}">${t(`settings.locales.${l}`)}</button>`).join('')}</div>
    </div>`,

  update(root, { ui }) {
    root.querySelectorAll('[data-theme-id]').forEach(b => b.classList.toggle('on', b.dataset.themeId === ui.theme));
    setSlider(root, 'size', ui.size, `${ui.size}px`);
    setSlider(root, 'magnify', Math.round(ui.magnify * 100), `${ui.magnify.toFixed(2)}×`);
    setHTML(root.querySelector('[data-ws-icons]'), row({ title: t('settings.wsIcons'), trailing: toggle(ui.wsIcons), attrs: 'data-toggle="wsIcons"' }));
    root.querySelectorAll('[data-widget]').forEach(el => setHTML(el.querySelector('[data-box]'), check(!ui.hidden.includes(el.dataset.widget))));
    root.querySelectorAll('[data-pet]').forEach(el => setHTML(el.querySelector('[data-box]'), radio((ui.pet ?? 'none') === el.dataset.pet)));
    root.querySelectorAll('[data-locale]').forEach(b => b.classList.toggle('on', b.dataset.locale === locale()));
  },

  click(target) {
    const ui = store.get().ui;
    const theme = target.closest('[data-theme-id]');
    if (theme) return update('ui', { theme: theme.dataset.themeId });
    if (target.closest('[data-toggle="wsIcons"]')) return update('ui', { wsIcons: !ui.wsIcons });
    const widget = target.closest('[data-widget]');
    if (widget) {
      const id = widget.dataset.widget;
      return update('ui', { hidden: ui.hidden.includes(id) ? ui.hidden.filter(h => h !== id) : [...ui.hidden, id] });
    }
    const pet = target.closest('[data-pet]');
    if (pet) {
      // one pet per dock: picking one replaces the current
      return update('ui', { pet: pet.dataset.pet === 'none' ? null : pet.dataset.pet });
    }
    const lang = target.closest('[data-locale]');
    // the UI is rendered once per page load, so a new language means a reload
    if (lang && lang.dataset.locale !== locale()) { savePref('locale', lang.dataset.locale); location.reload(); }
  },

  input(key, value) {
    if (key === 'size') update('ui', { size: value });
    if (key === 'magnify') update('ui', { magnify: value / 100 });
  },
};
