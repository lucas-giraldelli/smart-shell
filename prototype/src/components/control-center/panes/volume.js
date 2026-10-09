import { slider, setSlider, row, radio, setHTML } from '../../ui/ui.js';
import { icon } from '../../../core/icons.js';
import { connectedDevice } from '../../../services/bluetooth.js';
import { store, update } from '../../../state.js';
import { t } from '../../../i18n/index.js';

// Audio: output volume and device, microphone, per-app streams.
// Real shell: PipeWire via Quickshell.Services.Pipewire.
const clamp = v => Math.max(0, Math.min(100, v));

// the connected bluetooth headset shows up as an extra output
function sinks(audio, bluetooth) {
  const bt = connectedDevice(bluetooth);
  return bt ? [...audio.sinks, { id: 'bt', name: bt.name, meta: t('bluetooth.headsetOutput'), icon: 'headphones' }] : audio.sinks;
}

export default {
  id: 'volume',
  get label() { return t('volume.label'); },
  icon: 'volume-2',

  quickWidth: '4ch',
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
    ${store.get().audio.streams.map((s, i) => slider({ key: `stream-${i}`, label: s.name, iconName: 'app-window' })).join('')}`,

  update(root, { audio, bluetooth }) {
    const list = sinks(audio, bluetooth);
    const current = list.find(s => s.id === audio.sink) ?? list[0];
    setSlider(root, 'out', audio.volume, audio.muted ? t('common.muted') : audio.volume + '%');
    root.querySelector('[data-label="out"]').textContent = current.name;
    const mute = root.querySelector('[data-btn="out"]');
    setHTML(mute, icon(audio.muted ? 'volume-x' : 'volume-2'));
    mute.classList.toggle('off', audio.muted);

    const sinksHtml = list.map(s => row({
      icon: s.icon, title: s.name, meta: s.meta, trailing: radio(), active: s.id === current.id, attrs: `data-sink="${s.id}"`,
    })).join('');
    setHTML(root.querySelector('[data-sinks]'), sinksHtml);

    setSlider(root, 'mic', audio.mic, audio.micMuted ? t('common.muted') : audio.mic + '%');
    root.querySelector('[data-btn="mic"]').classList.toggle('off', audio.micMuted);
    audio.streams.forEach((s, i) => setSlider(root, `stream-${i}`, s.volume, s.volume + '%'));
  },

  click(target) {
    if (target.closest('[data-btn="out"]')) update('audio', a => ({ muted: !a.muted }));
    else if (target.closest('[data-btn="mic"]')) update('audio', a => ({ micMuted: !a.micMuted }));
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
      update('audio', a => ({ streams: a.streams.map((s, j) => (j === i ? { ...s, volume: value } : s)) }));
    }
  },
};
