import { store, update } from '../../state.js';
import { savePref } from '../../core/prefs.js';
import { t } from '../../i18n/index.js';
import { notify } from '../notifications/notifications.js';
import { species } from './species/index.js';
import * as rules from './tama-rules.js';

// Tamagotchi mode in the prototype (ui.tamaOn, off by default): the rules in
// tama-rules.js (shared with the shell), the state in the store's `tama`
// slice (saved in the browser), and the care menu a click on the pet opens.
export const { NEEDS, SIGN } = rules;
export const foodOf = kind => rules.foodOf(species[kind]);
const speed = () => store.get().tama.speed || 1;
export const urgent = s => rules.urgent(s, Date.now());
const ageDays = s => rules.ageDays(s, Date.now(), speed());
// recent pets (ms), for the diminishing returns; session only
let petted = [];

function save(n) {
  const keep = Object.assign({}, n);
  delete keep.speed;
  savePref('tama', keep);
}
function set(n) {
  update('tama', n);
  save(store.get().tama);
}

// time passes: `dt` seconds of real time
//   ctx: { kind, asleep, hot, load (CPU %), music, meeting }
export function tick(dt, ctx) {
  const s = store.get().tama;
  const n = rules.decay(s, dt, Object.assign({}, ctx, { sp: species[ctx.kind], now: Date.now(), speed: speed() }));
  if (n) return set(n);
  // it ran away: back as the ghost
  notify({ appName: 'smart-shell', summary: t('tama.ranAway', { name: t(`pets.names.${ctx.kind}`) }), body: t('tama.ranAwayBody') });
  set(rules.fresh(Date.now()));
  update('ui', { pet: 'ghost' });
}

// a care action from the menu: { say, effect } for the pet to act out
export function care(action, kind) {
  const now = Date.now();
  const r = rules.care(store.get().tama, action, { sp: species[kind], kind, petted, now });
  if (action === 'pet') petted = petted.filter(p => now - p < 120e3).concat([now]);
  if (r.n) set(r.n);
  return { say: r.say, effect: r.effect };
}

export function reset() {
  set(rules.fresh(Date.now()));
}

// the care menu (the pet's popover)
export function menuHTML(kind, s) {
  const d = ageDays(s), age = d < 1 ? t('tama.hours', { h: Math.floor(d * 24) }) : t('tama.days', { d: Math.floor(d) });
  const bar = k => {
    const v = Math.round(s[k]);
    const tone = v < 25 ? 'crit' : v < 50 ? 'warn' : 'ok';
    return `<div class="tm-need"><span>${t(`tama.${k}`)}</span><span class="tm-bar ${tone}"><i style="width:${v}%"></i></span><b>${v}</b></div>`;
  };
  const btn = (action, emoji, label, off = false) => `<button class="tm-act" data-care="${action}"${off ? ' disabled' : ''}><span>${emoji}</span>${label}</button>`;
  return `
    <div class="tm-head"><b>${t(`pets.names.${kind}`)}</b><span class="meta">${age}</span>${s.sick ? `<span class="tm-sick">${t('tama.sick')}</span>` : ''}</div>
    ${NEEDS.map(bar).join('')}
    <div class="tm-acts">
      ${btn('pet', '💗', t('tama.pet'))}
      ${btn('feed', foodOf(kind), t('tama.feed'))}
      ${btn('play', '🎾', t('tama.play'))}
      ${btn('clean', '🧼', t('tama.wash'))}
      ${btn('medicine', '💊', t('tama.medicine'), !s.sick)}
      ${btn('sleep', s.napping ? '☀️' : '🌙', t(s.napping ? 'tama.wake' : 'tama.sleep'))}
    </div>
`;
}
