import { slider, setSlider, row, radio, setHTML } from '../../ui/ui.js';
import { icon } from '../../../core/icons.js';
import { connectedDevice } from '../../../services/bluetooth.js';
import { store, update } from '../../../state.js';
import { t } from '../../../i18n/index.js';

// Audio: output volume and device, microphone, per-app streams.
// Real shell: PipeWire via Quickshell.Services.Pipewire.
const clamp = v => Math.max(0, Math.min(100, v));

// "HDMI · placa de vídeo"; an unnamed onboard output is "Saída digital onboard"
// a device's own description (its second line) and visibility, set from the
// pane (config audio.devices in the shell, keyed by the PipeWire node.name;
// here ui.audioDevices); the name stays the device's
const custom = id => store.get().ui.audioDevices?.[id] ?? {};
const setDevice = (id, change) => update('ui', u => {
  const all = { ...(u.audioDevices ?? {}) };
  const next = { ...(all[id] ?? {}), ...change };
  for (const k of Object.keys(next)) if (next[k] === undefined || next[k] === '' || next[k] === false) delete next[k];
  if (Object.keys(next).length) all[id] = next; else delete all[id];
  return { audioDevices: all };
});
let editing = null;     // the device being renamed
let showHidden = false; // the hidden devices' footer is open

export const sinkName = s => s.name ?? t(`volume.titles.${s.kind}`);
// the second line: the user's description, else connection · card
export const sinkMeta = s => custom(s.id).label || (s.meta ?? [s.kind && t(`volume.kinds.${s.kind}`), s.where && t(`volume.where.${s.where}`)].filter(Boolean).join(' · '));

// the connected bluetooth headset shows up as an extra output
function sinks(audio, bluetooth) {
  const bt = connectedDevice(bluetooth);
  return bt ? [...audio.sinks, { id: 'bt', name: bt.name, meta: t('bluetooth.headsetOutput'), icon: 'headphones' }] : audio.sinks;
}

export default {
  id: 'volume',
  get label() { return t('volume.label'); },
  icon: 'volume-2',

  quickWidth: '4.6ch', // fits "100%"
  quick: ({ audio }) => ({
    icon: audio.muted ? 'volume-x' : 'volume-2',
    text: audio.muted ? t('common.muted') : audio.volume + '%',
    tone: audio.muted ? 'muted' : '',
  }),
  wheel: dir => update('audio', a => ({ volume: clamp(a.volume + dir * 5), muted: false })),

  render: () => `
    <div class="sec">${t('volume.output')}</div>
    ${slider({ key: 'out', label: '', iconName: 'volume-2', button: true })}
    <div data-sinks></div>
    <div class="sec">${t('volume.input')}</div>
    ${slider({ key: 'mic', label: store.get().audio.micName, iconName: 'mic', button: true })}
    <div class="sec">${t('volume.apps')}</div>
    ${store.get().audio.streams.map((s, i) => slider({ key: `stream-${i}`, label: s.name, iconName: s.muted ? 'volume-x' : 'volume-2', button: true })).join('')}`,

  update(root, { audio, bluetooth }) {
    const list = sinks(audio, bluetooth);
    const current = list.find(s => s.id === audio.sink) ?? list[0];
    setSlider(root, 'out', audio.volume, audio.muted ? t('common.muted') : audio.volume + '%');
    root.querySelector('[data-label="out"]').textContent = sinkName(current);
    const mute = root.querySelector('[data-btn="out"]');
    setHTML(mute, icon(audio.muted ? 'volume-x' : 'volume-2'));
    mute.classList.toggle('off', audio.muted);

    // devices: rename / hide on hover; hidden ones fold into a footer
    const shown = list.filter(s => !custom(s.id).hidden || s.id === current.id);
    const hidden = list.filter(s => !shown.includes(s));
    const actions = s => `<span class="dev-actions">
        <button class="ib dev-btn" data-dev-rename="${s.id}" title="${t('volume.editLabel')}">${icon('pencil')}</button>
        <button class="ib dev-btn" data-dev-hide="${s.id}" title="${t('volume.hide')}">${icon('eye-off')}</button></span>`;
    const sinksHtml = shown.map(s => row({
      icon: s.icon,
      title: sinkName(s),
      meta: editing === s.id ? `<input class="dev-name" data-dev-input="${s.id}" value="${sinkMeta(s)}" spellcheck="false">` : sinkMeta(s), trailing: actions(s) + radio(), active: s.id === current.id, attrs: `data-sink="${s.id}"`,
    })).join('') + (hidden.length ? `
      <div class="dev-hidden${showHidden ? ' open' : ''}">
        <button class="dev-toggle" data-dev-toggle>${icon('chevron-right', 'dev-chev')}${t('volume.hidden', { n: hidden.length })}</button>
        ${showHidden ? hidden.map(s => row({ icon: s.icon, title: sinkName(s), meta: sinkMeta(s),
          trailing: `<button class="ib dev-btn" data-dev-show="${s.id}" title="${t('volume.show')}">${icon('eye')}</button>` })).join('') : ''}
      </div>` : '');
    setHTML(root.querySelector('[data-sinks]'), sinksHtml);
    const input = root.querySelector('[data-dev-input]');
    if (input && document.activeElement !== input) { input.focus(); input.select(); }
    if (!root.devKeys) {
      root.devKeys = true;
      // Enter saves the description (empty = back to the default), Esc cancels
      root.addEventListener('keydown', e => {
        const el = e.target.closest?.('[data-dev-input]');
        if (!el) return;
        if (e.key === 'Enter') { editing = null; setDevice(el.dataset.devInput, { label: el.value.trim() }); }
        if (e.key === 'Escape') { editing = null; setDevice(el.dataset.devInput, {}); }
      });
    }

    setSlider(root, 'mic', audio.mic, audio.micMuted ? t('common.muted') : audio.mic + '%');
    root.querySelector('[data-btn="mic"]').classList.toggle('off', audio.micMuted);
    audio.streams.forEach((s, i) => {
      setSlider(root, `stream-${i}`, s.volume, s.muted ? t('common.muted') : s.volume + '%');
      const btn = root.querySelector(`[data-btn="stream-${i}"]`);
      setHTML(btn, icon(s.muted ? 'volume-x' : 'volume-2'));
      btn.classList.toggle('off', !!s.muted);
    });
  },

  click(target) {
    const rename = target.closest('[data-dev-rename]'), hide = target.closest('[data-dev-hide]'), show = target.closest('[data-dev-show]');
    if (rename) { editing = rename.dataset.devRename; return setDevice(editing, {}); }
    if (hide) return setDevice(hide.dataset.devHide, { hidden: true });
    if (show) return setDevice(show.dataset.devShow, { hidden: false });
    if (target.closest('[data-dev-toggle]')) { showHidden = !showHidden; return setDevice('_', {}); }
    if (target.closest('[data-dev-input]')) return;
    if (target.closest('[data-btn="out"]')) update('audio', a => ({ muted: !a.muted }));
    else if (target.closest('[data-btn="mic"]')) update('audio', a => ({ micMuted: !a.micMuted }));
    else if (target.closest('[data-btn^="stream-"]')) {
      const i = +target.closest('[data-btn]').dataset.btn.split('-')[1];
      update('audio', a => ({ streams: a.streams.map((s, j) => (j === i ? { ...s, muted: !s.muted } : s)) }));
    }
    else {
      const sink = target.closest('[data-sink]');
      if (sink) update('audio', { sink: sink.dataset.sink });
    }
  },

  input(key, value) {
    if (key === 'out') update('audio', { volume: value, muted: false });
    else if (key === 'mic') update('audio', { mic: value, micMuted: false });
    else if (key.startsWith('stream-')) {
      const i = +key.split('-')[1];
      update('audio', a => ({ streams: a.streams.map((s, j) => (j === i ? { ...s, volume: value, muted: false } : s)) }));
    }
  },
};
