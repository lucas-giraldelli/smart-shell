import { store, update } from '../../state.js';
import { savePref } from '../../core/prefs.js';
import { t } from '../../i18n/index.js';
import { notify } from '../notifications/notifications.js';
import { fresh } from './tama-fresh.js';

// Tamagotchi mode (ui.tamaOn, off by default): the pet has needs that run down
// over hours, and a right click on it opens its care menu.
//   food    fed by Feed; down 12/h
//   fun     raised by Play (costs energy); down 10/h
//   clean   down 4/h, and 10/h more per dropping on the dock; Clean restores it
//   energy  down 6/h awake, up 30/h asleep (low CPU, or put to bed)
//   health  falls while it's sick or a need is nearly empty, recovers when fed
//           and happy; at 0 the pet runs away and comes back as the ghost
// It drops one every 2.5-4.5 h while fed; dirt, droppings or a hot PC can make
// it sick (Medicine cures it). A need running out counts a care mistake.
// It grows: a baby the first day (drawn smaller), young up to 3 days, then adult.
export const NEEDS = ['food', 'fun', 'clean', 'energy', 'health'];
// what each species eats
export const FOOD = {
  cat: '🐟', blackcat: '🐟', penguin: '🐟', shiba: '🦴', corgi: '🦴', fox: '🍗', bunny: '🥕', capy: '🍊',
  frog: '🪰', duck: '🍞', panda: '🎋', owl: '🐭', turtle: '🥬', octopus: '🦐', macaw: '🌰', anteater: '🐜',
  ghost: '🍬', pig: '🍎',
};
// the sign over its head for its most urgent need
export const SIGN = { food: '🍖', fun: '🎾', clean: '🧼', energy: '💤', sick: '🤒' };

const clamp = v => Math.max(0, Math.min(100, v));
const save = s => { const { speed, ...keep } = s; savePref('tama', keep); };

export const ageDays = s => (Date.now() - s.bornAt) * (s.speed ?? 1) / 864e5;
export const stage = s => (ageDays(s) < 1 ? 'baby' : ageDays(s) < 3 ? 'young' : 'adult');

// the most urgent need, for the sign over its head ('' = all fine)
export function urgent(s) {
  if (s.sick) return 'sick';
  return ['food', 'energy', 'clean', 'fun'].filter(k => s[k] < 25).sort((a, b) => s[a] - s[b])[0] ?? '';
}

// time passes: `dt` seconds of real time, times the mock's speed-up
export function tick(dt, { asleep, hot }) {
  const s = store.get().tama;
  const h = dt * (s.speed ?? 1) / 3600;
  const n = {
    ...s,
    food: clamp(s.food - 12 * h),
    fun: clamp(s.fun - 10 * h),
    clean: clamp(s.clean - (4 + 10 * s.poops.length) * h),
    energy: clamp(s.energy + (asleep || s.napping ? 30 : -6) * h),
    nextPoop: s.nextPoop - h * (s.food > 30 ? 1 : .3),
  };
  if (n.nextPoop <= 0) {
    if (s.poops.length < 4) n.poops = [...s.poops, .1 + Math.random() * .8];
    n.nextPoop = 2.5 + Math.random() * 2;
  }
  if (!s.sick && (n.clean < 25 || n.poops.length >= 3 || hot) && Math.random() < h * 2) n.sick = true;
  const low = ['food', 'fun', 'clean', 'energy'].filter(k => n[k] < 15).length;
  n.health = clamp(s.health - (s.sick ? 10 : 0) * h - 5 * low * h + (!low && !s.sick && n.food > 50 && n.fun > 50 ? 4 : 0) * h);
  for (const k of ['food', 'fun', 'energy']) if (s[k] > 0 && n[k] === 0) n.mistakes++;
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
export function care(action) {
  const s = store.get().tama;
  const n = { ...s };
  let out = {};
  if (action === 'feed') {
    if (s.food >= 95) return { say: 'no' };
    Object.assign(n, { food: clamp(s.food + 30), energy: clamp(s.energy + 5) });
    out = { say: 'yum', effect: 'feed' };
  } else if (action === 'play') {
    if (s.energy < 15) return { say: 'no' };
    Object.assign(n, { fun: clamp(s.fun + 30), energy: clamp(s.energy - 10), food: clamp(s.food - 5) });
    out = { say: 'yay', effect: 'play' };
  } else if (action === 'clean') {
    Object.assign(n, { clean: 100, poops: [] });
    out = { effect: 'clean' };
  } else if (action === 'medicine') {
    if (!s.sick) return { say: 'no' };
    Object.assign(n, { sick: false, health: clamp(s.health + 20) });
    out = { effect: 'medicine' };
  } else if (action === 'sleep') {
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
      ${btn('feed', FOOD[kind] ?? '🍖', t('tama.feed'))}
      ${btn('play', '🎾', t('tama.play'))}
      ${btn('clean', '🧼', t('tama.wash'))}
      ${btn('medicine', '💊', t('tama.medicine'), !s.sick)}
      ${btn('sleep', s.napping ? '☀️' : '🌙', t(s.napping ? 'tama.wake' : 'tama.sleep'))}
    </div>
    <div class="meta tm-foot">${t('tama.mistakes', { n: s.mistakes })}</div>`;
}
