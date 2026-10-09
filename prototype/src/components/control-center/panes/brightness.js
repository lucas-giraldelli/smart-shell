import { slider, setSlider, row, toggle, setHTML } from '../../ui/ui.js';
import { store, update } from '../../../state.js';
import { missingText } from '../../../data/capabilities.js';
import { t } from '../../../i18n/index.js';

// Monitor brightness (ddcutil, DDC/CI) and night light (hyprsunset).
// Without hyprsunset the night light section is shown disabled.
const PRESETS = [['night', 10], ['normal', 30], ['day', 60], ['max', 100]];
const clamp = v => Math.max(5, Math.min(100, v));

export default {
  id: 'brightness',
  get label() { return t('brightness.label'); },
  icon: 'sun',
  requires: 'ddcutil',

  quickWidth: '4.6ch', // fits "100%"
  quick: ({ display }) => ({ icon: 'sun', text: display.brightness + '%' }),
  wheel: dir => update('display', d => ({ brightness: clamp(d.brightness + dir * 5) })),

  render() {
    const { display, caps } = store.get();
    return `
      <div class="sec">${t('brightness.monitor')}</div>
      ${slider({ key: 'bri', label: `${display.name} · DDC/CI`, iconName: 'sun', step: 5 })}
      <div class="presets">${PRESETS.map(([id, v]) => `<button data-preset="${v}">${t(`brightness.presets.${id}`)}</button>`).join('')}</div>
      <div class="sec">${t('brightness.night')}</div>
      <div class="${caps.hyprsunset ? '' : 'disabled-block'}">
        <div data-night></div>
        ${slider({ key: 'kelvin', label: t('brightness.temperature'), iconName: 'moon', min: 2500, max: 6500, step: 100, warm: true })}
      </div>`;
  },

  update(root, { display, caps }) {
    setSlider(root, 'bri', display.brightness, display.brightness + '%');
    root.querySelectorAll('[data-preset]').forEach(b => b.classList.toggle('on', +b.dataset.preset === display.brightness));
    const meta = caps.hyprsunset ? 'hyprsunset' : missingText('hyprsunset');
    const night = row({ icon: 'moon', title: t('brightness.night'), meta, trailing: toggle(caps.hyprsunset && display.night) });
    setHTML(root.querySelector('[data-night]'), night);
    setSlider(root, 'kelvin', display.nightK, display.nightK + 'K');
  },

  click(target) {
    const preset = target.closest('[data-preset]');
    if (preset) update('display', { brightness: +preset.dataset.preset });
    else if (target.closest('[data-night]')) update('display', d => ({ night: !d.night }));
  },

  input(key, value) {
    if (key === 'bri') update('display', { brightness: value });
    else if (key === 'kelvin') update('display', { nightK: value, night: true });
  },
};
