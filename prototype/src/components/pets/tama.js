import { store, update } from '../../state.js';
import { savePref } from '../../core/prefs.js';
import { t } from '../../i18n/index.js';
import { notify } from '../notifications/notifications.js';
import { fresh } from './tama-fresh.js';
import { species } from './species/index.js';

// Tamagotchi mode (ui.tamaOn, off by default): the pet has needs that run down
// over hours, and a right click on it opens its care menu.
//   food    fed by Feed; down 12/h
//   fun     raised by Play (costs energy) and a little by Pet; down 10/h
//   clean   down 4/h, and 10/h more per dropping on the dock; Clean restores it
//   energy  down 6/h awake, up 30/h asleep (low CPU, or put to bed)
//   health  falls while it's sick or a need is nearly empty, recovers when fed
//           and happy; at 0 the pet runs away and comes back as the ghost
// It drops one every 2.5-4.5 h while fed; dirt, droppings or a hot PC can make
// it sick (Medicine cures it).
// It grows: a baby the first day (drawn smaller), young up to 3 days, then adult.
// Each species has its own pace (its `pace` and `bath`); a loaded CPU tires it a little, a hot
// one tires it and makes it sweat (and can make it sick), a work meeting bores it a little, music cheers it up, and at night (22-6 h) it
// tires faster and asks for bed sooner. Most dislike a bath (the duck, penguin
// and frog love one; the pig would rather have mud), and petting it over and
// over pleases it less each time (a cat ends up hissing).
export const NEEDS = ['food', 'fun', 'clean', 'energy', 'health'];
// a species' pace for a need (species.pace, default 1) and how it takes a bath
// (species.bath: 1 loves it, -1 sulks, default 0)
const trait = (kind, k) => (k === 'bath' ? species[kind]?.bath ?? 0 : species[kind]?.pace?.[k] ?? 1);
export const foodOf = kind => species[kind]?.food ?? '🍖';
const night = () => { const h = new Date().getHours(); return h >= 22 || h < 6; };
// recent pets (ms), for the diminishing returns; session only
let petted = [];
// the sign over its head for its most urgent need
export const SIGN = { food: '🍖', fun: '🎾', clean: '🧼', energy: '💤', sick: '🤒' };

const clamp = v => Math.max(0, Math.min(100, v));
const save = s => { const { speed, ...keep } = s; savePref('tama', keep); };

export const ageDays = s => (Date.now() - s.bornAt) * (s.speed ?? 1) / 864e5;
export const stage = s => (ageDays(s) < 1 ? 'baby' : ageDays(s) < 3 ? 'young' : 'adult');

// the most urgent need, for the sign over its head ('' = all fine)
export function urgent(s) {
  if (s.sick) return 'sick';
  // at night it asks for bed while it still has some energy left
  const low = k => s[k] < (k === 'energy' && night() ? 45 : 25);
  return ['food', 'energy', 'clean', 'fun'].filter(low).sort((a, b) => s[a] - s[b])[0] ?? '';
}

// time passes: `dt` seconds of real time, times the mock's speed-up
//   ctx: { kind, asleep, hot, load (CPU %), music (playing), meeting (a work one) }
export function tick(dt, { kind, asleep, hot, load = 0, music = false, meeting = false }) {
  const s = store.get().tama;
  const h = dt * (s.speed ?? 1) / 3600;
  // a busy CPU tires it a little; a hot one tires it and makes it sweat (dirtier)
  const tired = 6 * trait(kind, 'energy') * (night() ? 1.6 : 1) + (load > 72 ? 1.5 : 0) + (hot ? 1.5 : 0);
  const n = {
    ...s,
    food: clamp(s.food - 12 * trait(kind, 'food') * h),
    fun: clamp(s.fun - (10 * trait(kind, 'fun') + (meeting ? 2 : 0) - (music ? 6 : 0)) * h),
    clean: clamp(s.clean - (4 + 10 * s.poops.length + (hot ? 2 : 0)) * trait(kind, 'clean') * h),
    energy: clamp(s.energy + (asleep || s.napping ? 30 : -tired) * h),
    nextPoop: s.nextPoop - h * (s.food > 30 ? 1 : .3),
  };
  if (n.nextPoop <= 0) {
    if (s.poops.length < 4) n.poops = [...s.poops, .1 + Math.random() * .8];
    n.nextPoop = 2.5 + Math.random() * 2;
  }
  if (!s.sick && (n.clean < 25 || n.poops.length >= 3 || hot) && Math.random() < h * 2) n.sick = true;
  const low = ['food', 'fun', 'clean', 'energy'].filter(k => n[k] < 15).length;
  n.health = clamp(s.health - (s.sick ? 10 : 0) * h - 5 * low * h + (!low && !s.sick && n.food > 50 && n.fun > 50 ? 4 : 0) * h);
  if (s.napping && n.energy >= 100) n.napping = false;
  if (n.health === 0) return runAway();
  update('tama', n);
  save(n);
}

function runAway() {
  const { pet } = store.get().ui;
  notify({ appName: 'smart-shell', summary: t('tama.ranAway', { name: t(`pets.names.${pet}`) }), body: t('tama.ranAwayBody') });
  const n = { ...fresh(), speed: store.get().tama.speed };
  update('tama', n);
  save(n);
  update('ui', { pet: 'ghost' });
}

// a care action from the menu; returns what the pet does about it
//   { say, effect } - a word (pets.says) and an effect to play (pets.js)
export function care(action, kind) {
  const s = store.get().tama;
  const n = { ...s };
  let out = {};
  if (action === 'feed') {
    if (s.food >= 95) return { say: 'no' };
    Object.assign(n, { food: clamp(s.food + 30), energy: clamp(s.energy + 5) });
    out = { effect: 'feed' };
  } else if (action === 'play') {
    if (s.energy < 15) return { say: 'no' };
    Object.assign(n, { fun: clamp(s.fun + 30), energy: clamp(s.energy - 10), food: clamp(s.food - 5) });
    out = { effect: 'play' };
  } else if (action === 'pet') {
    // each pet in the last 2 minutes halves the next one's joy; a cat has had enough at 4
    const now = Date.now();
    petted = [...petted.filter(t => now - t < 120e3), now];
    if ((kind === 'cat' || kind === 'blackcat') && petted.length >= 4) {
      Object.assign(n, { fun: clamp(s.fun - 3) });
      out = { say: 'hiss' };
    } else {
      Object.assign(n, { fun: clamp(s.fun + 8 / 2 ** (petted.length - 1)), health: clamp(s.health + 1) });
      out = { effect: 'pet' };
    }
  } else if (action === 'clean') {
    const bath = trait(kind, 'bath');
    Object.assign(n, { clean: 100, poops: [], fun: clamp(s.fun + (bath > 0 ? 10 : bath < 0 ? -8 : -3)) });
    out = { effect: 'clean' };
  } else if (action === 'medicine') {
    if (!s.sick) return { say: 'no' };
    Object.assign(n, { sick: false, health: clamp(s.health + 20) });
    out = { effect: 'medicine' };
  } else if (action === 'sleep') {
    // not sleepy yet: it won't go to bed
    if (!s.napping && s.energy > 70) return { say: 'no' };
    n.napping = !s.napping;
  } else if (action === 'poop') {
    // one dropping clicked away
    Object.assign(n, { poops: s.poops.slice(1), clean: clamp(s.clean + 10) });
    out = { effect: 'clean' };
  }
  update('tama', n);
  save(n);
  return out;
}

export function reset() {
  const n = { ...fresh(), speed: store.get().tama.speed };
  update('tama', n);
  save(n);
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
    <div class="tm-head"><b>${t(`pets.names.${kind}`)}</b><span class="meta">${t(`tama.${stage(s)}`)} · ${age}</span>${s.sick ? `<span class="tm-sick">${t('tama.sick')}</span>` : ''}</div>
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
