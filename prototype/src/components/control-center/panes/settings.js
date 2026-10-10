import { icon } from '../../../core/icons.js';
import { savePref } from '../../../core/prefs.js';
import { store, update } from '../../../state.js';
import { themes } from '../../../data/themes.js';
import { widgets } from '../../registry.js';
import { species } from '../../pets/pets.js';
import { slider, setSlider, setHTML } from '../../ui/ui.js';
import { t, locale, locales } from '../../../i18n/index.js';

// The dock's own settings: look, which widgets and pets show, language.
// A tab only - it adds nothing to the quick tile. Real shell: saved to the
// shell's state file. The quick tile can't be switched off here, since that
// would hide this very tab.
const TOGGLEABLE = Object.keys(widgets).filter(id => id !== 'quick');
const check = on => `<span class="chk${on ? ' on' : ''}">${icon('check')}</span>`;
// a pet's sprite at rest, for the pet picker (none = an empty slot)
const sprite = k => (species[k]
  ? `<span class="pet-mini"><svg viewBox="0 0 46 36">${species[k].svg}</svg></span>`
  : '<span class="pet-mini empty"></span>');
const petName = k => t(k && species[k] ? `pets.names.${k}` : 'settings.noPet');

// The pet list floats out of the popover: moved to <body> while open (the
// pane scrolls and clips, and the dock is transformed), placed under the
// picker - or above it without room below - as wide as the pet row. A click
// on a pet picks it; any other click closes it.
let floating = null;
function closePetList() {
  floating?.list.remove();
  floating?.select.classList.remove('open');
  removeEventListener('pointerdown', floating?.outside, true);
  floating = null;
}
function togglePetList(select) {
  if (floating) return closePetList();
  const list = select.querySelector('.ps-list').cloneNode(true);
  list.classList.add('ps-float');
  const row = select.closest('.pet-row').getBoundingClientRect(), r = select.getBoundingClientRect();
  const up = innerHeight - r.bottom < 230;
  Object.assign(list.style, { left: `${row.left}px`, width: `${row.width}px`, [up ? 'bottom' : 'top']: up ? `${innerHeight - r.top + 4}px` : `${r.bottom + 4}px` });
  list.addEventListener('click', e => {
    const pet = e.target.closest('[data-pet]');
    if (!pet) return;
    closePetList();
    // one pet per dock: picking one replaces the current
    update('ui', { pet: pet.dataset.pet === 'none' ? null : pet.dataset.pet });
  });
  const outside = e => { if (!list.contains(e.target) && !select.contains(e.target)) closePetList(); };
  addEventListener('pointerdown', outside, true);
  document.body.append(list);
  select.classList.add('open');
  floating = { list, select, outside };
}

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
      <div class="checks"><label class="check-row" data-flag="weatherFx"><span data-box></span>${t('settings.weatherFx')}</label></div>
      <div class="seg-row"><span class="grow">${t('settings.wsStyle')}</span><span class="seg">${
        ['icons', 'numbers', 'dots'].map(s => `<button data-ws-style="${s}">${t(`settings.wsStyles.${s}`)}</button>`).join('')}</span></div>

      <div class="sec">${t('settings.widgets')}</div>
      <div class="checks">${TOGGLEABLE.map(id => `<label class="check-row" data-widget="${id}"><span data-box></span>${t(`widgets.${id}`)}</label>`).join('')}</div>

      <div class="sec">${t('settings.pets')}</div>
      <div class="pet-row">
      <div class="pet-select" data-pet-select>
        <button class="ps-trigger" data-ps-toggle aria-haspopup="listbox">
          <span data-ps-current></span>${icon('chevron-down', 'ps-chev')}
        </button>
        <div class="ps-list" role="listbox">${[...Object.keys(species), 'none'].map(k => `
          <button class="ps-opt" role="option" data-pet="${k}">${sprite(k)}<span class="grow">${petName(k)}</span><span class="ps-check">${icon('check')}</span></button>`).join('')}
        </div>
      </div>
      <label class="check-row" data-flag="tamaOn" title="${t('settings.tamaTip')}"><span data-box></span>${t('settings.tama')}</label>
      </div>

      <div class="sec">${t('settings.language')}</div>
      <div class="langs">${locales().map(l => `<button data-locale="${l}">${t(`settings.locales.${l}`)}</button>`).join('')}</div>
      <div class="seg-row"><span class="grow">${t('settings.clock')}</span><span class="seg">${
        ['24h', '12h'].map(f => `<button data-clock-format="${f}">${f}</button>`).join('')}</span></div>
    </div>`,

  update(root, { ui }) {
    root.querySelectorAll('[data-theme-id]').forEach(b => b.classList.toggle('on', b.dataset.themeId === ui.theme));
    setSlider(root, 'size', ui.size, `${ui.size}px`);
    root.querySelectorAll('[data-ws-style]').forEach(b => b.classList.toggle('on', b.dataset.wsStyle === ui.wsStyle));
    root.querySelectorAll('[data-widget]').forEach(el => setHTML(el.querySelector('[data-box]'), check(!ui.hidden.includes(el.dataset.widget))));
    root.querySelectorAll('[data-flag]').forEach(el => setHTML(el.querySelector('[data-box]'), check(!!ui[el.dataset.flag])));
    setHTML(root.querySelector('[data-ps-current]'), `${sprite(ui.pet)}<span class="grow">${petName(ui.pet)}</span>`);
    root.querySelectorAll('.ps-opt').forEach(el => el.classList.toggle('on', (ui.pet ?? 'none') === el.dataset.pet));
    root.querySelectorAll('[data-clock-format]').forEach(b => b.classList.toggle('on', b.dataset.clockFormat === ui.clockFormat));
    root.querySelectorAll('[data-locale]').forEach(b => b.classList.toggle('on', b.dataset.locale === locale()));
  },

  click(target) {
    const ui = store.get().ui;
    const theme = target.closest('[data-theme-id]');
    if (theme) return update('ui', { theme: theme.dataset.themeId });
    const clockFormat = target.closest('[data-clock-format]');
    if (clockFormat) return update('ui', { clockFormat: clockFormat.dataset.clockFormat });
    const wsStyle = target.closest('[data-ws-style]');
    if (wsStyle) return update('ui', { wsStyle: wsStyle.dataset.wsStyle });
    const flag = target.closest('[data-flag]');
    if (flag) return update('ui', { [flag.dataset.flag]: !ui[flag.dataset.flag] });
    const widget = target.closest('[data-widget]');
    if (widget) {
      const id = widget.dataset.widget;
      return update('ui', { hidden: ui.hidden.includes(id) ? ui.hidden.filter(h => h !== id) : [...ui.hidden, id] });
    }
    const select = target.closest('[data-pet-select]');
    if (target.closest('[data-ps-toggle]')) return togglePetList(select);

    const lang = target.closest('[data-locale]');
    // the UI is rendered once per page load, so a new language means a reload
    if (lang && lang.dataset.locale !== locale()) { savePref('locale', lang.dataset.locale); location.reload(); }
  },

  input(key, value) {
    if (key === 'size') update('ui', { size: value });
  },
};
