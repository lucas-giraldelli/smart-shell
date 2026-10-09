import { t } from '../../i18n/index.js';

// Behaviour shared by every pet. A pet reacts to CPU load:
//   sleep (< 10%)  ·  idle (< 40%)  ·  walk (< 72%)  ·  run
// While idle it picks weighted actions; each species adds or overrides actions
// through `acts` and can set speed / hop / waddle / chill (never runs).
// An action's `pose` becomes a CSS class on the pet while it stands still
// ('lie', 'sleep', or any species-specific one like the frog's 'croak').
// Outside activities override all of that: during a work meeting every pet
// stops in front of a laptop and types; while YouTube Music plays
// (config pets.danceWith) every pet dances its own dance (pets.css).

const BASE_ACTS = [
  { name: 'stand', w: 3, dur: [2, 5] },
  { name: 'stroll', w: 4, dur: [3, 7], speed: 26 },
  { name: 'turn', w: 1, dur: [.8, 1.5], turn: true },
];
const STATE_SPEED = { sleep: 0, walk: 34, run: 150 };

const SWITCH_DELAY = 1.2; // a load change must hold this long before the pet reacts

// drawn in front of every pet, shown only during a work meeting
const LAPTOP = `
  <g class="laptop">
    <rect x="40" y="18.5" width="12" height="9" rx="1.2" fill="#1f2937" stroke="#94a3b8" stroke-width=".6"/>
    <rect class="screen" x="41.2" y="19.7" width="9.6" height="6.6" rx=".6" fill="#7dd3fc"/>
    <rect x="37.5" y="27.6" width="16" height="2" rx="1" fill="#94a3b8"/>
  </g>`;

function actionsFor(species) {
  const byName = new Map(BASE_ACTS.map(a => [a.name, a]));
  for (const a of species.acts ?? []) byName.set(a.name, a);
  return [...byName.values()];
}

export function createPet(kind, species, host) {
  // the species name picks its dance in pets.css
  const acts = actionsFor(species);
  const mult = species.speed ?? 1;
  const base = 'pet' + (species.hop ? ' hop' : '') + (species.waddle ? ' waddle' : '');
  const el = document.createElement('div');
  el.className = base;
  el.dataset.kind = kind;
  el.innerHTML = `<span class="bubble"></span><span class="zzz">z</span><span class="zzz">z</span>
    <svg viewBox="0 0 46 36"><g class="flip">${species.svg}${LAPTOP}</g></svg>`;
  host.append(el);
  const flip = el.querySelector('.flip');
  const bubble = el.querySelector('.bubble');

  // each pet reacts at slightly different loads, so they don't all switch at once
  const jitter = (Math.random() - .5) * 12;
  let x = 20 + Math.random() * Math.max(0, host.offsetWidth - 100);
  let dir = Math.random() < .5 ? -1 : 1, v = 0;
  let state = 'idle', pending = null, pendingT = 0;
  let act = null, actLeft = 0, jumpLeft = 0;
  let lastCls = '', lastStep = '', lastDir = 0, lastMood = '';

  // config thresholds.cpu: below `sleep` it sleeps, below `idle` it idles,
  // below `walk` it walks, above it runs
  let cpu = { sleep: 10, idle: 40, walk: 72 };
  function loadState(load) {
    const l = load + jitter;
    if (l < cpu.sleep) return 'sleep';
    if (l < cpu.idle) return 'idle';
    if (l < cpu.walk || species.chill) return 'walk';
    return 'run';
  }

  // dancing, it now and then takes a few steps (every 8-14 s, for 1.5-3 s)
  // still moving to the music, then dances in place again
  let danceWalkIn = 8 + Math.random() * 6, danceWalkLeft = 0;

  function pickAct() {
    let r = Math.random() * acts.reduce((t, a) => t + a.w, 0);
    act = acts.find(a => (r -= a.w) < 0) ?? acts[0];
    actLeft = act.dur[0] + Math.random() * (act.dur[1] - act.dur[0]);
    if (act.turn) dir = -dir;
    if (act.jump) jumpLeft = .55;
  }

  el.addEventListener('click', () => {
    const heart = document.createElement('span');
    heart.className = 'heart';
    heart.textContent = '♥';
    el.append(heart);
    setTimeout(() => heart.remove(), 1000);
  });

  // dancing: bursts of 2-4 music notes over the pet's head every 1.2-1.8 s,
  // staggered 120 ms, each drifting up and sideways and fading in 1.5 s
  // (at most 8 alive)
  let burstIn = 0;
  const NOTE_COLORS = ['var(--accent)', '#ffffff', 'color-mix(in srgb, var(--accent) 60%, #fff)', 'color-mix(in srgb, var(--accent) 70%, #f0abfc)'];
  function note() {
    if (el.querySelectorAll('.note').length >= 8) return;
    const n = document.createElement('span');
    n.className = 'note';
    n.textContent = Math.random() < .5 ? '♪' : '♫';
    n.style.setProperty('--dx', `${(Math.random() * 2 - 1) * 12}px`);
    n.style.setProperty('--rot', `${(Math.random() * 2 - 1) * 20}deg`);
    n.style.setProperty('--size', `${10 + Math.random() * 4}px`);
    n.style.setProperty('--note', NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)]);
    el.append(n);
    setTimeout(() => n.remove(), 1500);
  }
  function burst() {
    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) setTimeout(note, i * 120);
  }

  // opts: { cpu: config thresholds.cpu, heavy: 0 | 1 | 2 (free RAM warn / crit) }
  function step(dt, load, activity = null, opts = {}) {
    if (opts.cpu) cpu = opts.cpu;
    if (activity === 'dance') {
      if ((burstIn -= dt) <= 0) { burst(); burstIn = 1.2 + Math.random() * .6; }
    } else burstIn = 0;
    const want = loadState(load);
    if (want === state) pending = null;
    else {
      if (pending !== want) { pending = want; pendingT = 0; }
      if ((pendingT += dt) > SWITCH_DELAY) { state = want; pending = null; act = null; }
    }

    let target, pose = '';
    if (state === 'idle') {
      if (!act || (actLeft -= dt) <= 0) pickAct();
      target = act.speed ?? 0;
      if (act.pose) pose = act.pose === 'sleep' ? 'lie sleep' : act.pose;
    } else {
      target = STATE_SPEED[state];
      if (state === 'sleep') pose = 'lie sleep';
    }
    if (activity === 'work') pose = 'work';
    else if (activity === 'dance') pose = 'dance';
    if (pose) target = 0;
    if (activity === 'dance') {
      if (danceWalkLeft > 0) {
        danceWalkLeft -= dt;
        target = 30;
      } else if ((danceWalkIn -= dt) <= 0) {
        danceWalkIn = 8 + Math.random() * 6;
        danceWalkLeft = 1.5 + Math.random() * 1.5;
        if (Math.random() < .5) dir = -dir;
      }
    }

    // ease toward the target speed instead of jumping to it; low free RAM
    // makes it heavy and slow
    const heavy = opts.heavy ? .6 : 1;
    v += (target * mult * heavy - v) * (1 - Math.exp(-dt * 4));
    if (target === 0 && v < .5) v = 0;
    jumpLeft = Math.max(0, jumpLeft - dt);

    const max = host.offsetWidth - 60;
    x += dir * v * dt;
    if (x > max) { x = max; dir = -1; }
    if (x < 14) { x = 14; dir = 1; }
    el.style.left = x.toFixed(1) + 'px';
    if (dir !== lastDir) { flip.style.transform = dir < 0 ? 'scaleX(-1)' : ''; lastDir = dir; }

    const moving = v > 4;
    const cls = [base, moving && 'moving', v > 90 && 'fast', (pose === 'dance' || (pose && v < 3)) && pose, jumpLeft > 0 && 'jump',
      opts.heavy && 'heavy', opts.heavy === 2 && 'sweat',
      // the heat only shows while it walks or runs - not dancing, at the laptop, asleep or idling
      moving && !pose && opts.hot && 'hot', moving && !pose && opts.hot === 2 && 'scorch']
      .filter(Boolean).join(' ');
    if (cls !== lastCls) { el.className = cls; lastCls = cls; }
    if (moving) {
      // legs keep pace with the body: faster walk, shorter step
      const st = (Math.round(Math.min(.6, Math.max(.16, 14 / v)) * 25) / 25).toFixed(2) + 's';
      if (st !== lastStep) { el.style.setProperty('--step', st); lastStep = st; }
    }

    let mood = t(`pets.moods.${activity === 'work' || activity === 'dance' ? activity : state === 'idle' ? act?.name ?? 'stand' : state}`);
    if (species.chill && load + jitter >= 72) mood = t('pets.chill');
    const text = t('pets.bubble', { name: t(`pets.names.${kind}`), mood, load: Math.round(load) });
    if (text !== lastMood) { bubble.textContent = text; lastMood = text; }
  }

  return { kind, step, remove: () => el.remove() };
}
