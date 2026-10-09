// Behaviour shared by every pet. A pet reacts to CPU load:
//   sleep (< 10%)  ·  idle (< 40%)  ·  walk (< 72%)  ·  run
// While idle it picks weighted actions; each species adds or overrides actions
// through `acts` and can set speed / hop / waddle / chill (never runs).

const BASE_ACTS = [
  { name: 'stand', w: 3, dur: [2, 5] },
  { name: 'stroll', w: 4, dur: [3, 7], speed: 26 },
  { name: 'turn', w: 1, dur: [.8, 1.5], turn: true },
];
const STATE_SPEED = { sleep: 0, walk: 34, run: 150 };
const MOODS = {
  sleep: 'Dormindo', walk: 'Andando', run: 'Correndo!',
  stand: 'De boa', stroll: 'Passeando', turn: 'Olhando em volta', lie: 'Deitado',
  nap: 'Cochilando', zoomies: 'Zoomies!', jump: 'Pulando', pounce: 'Dando o bote',
};
const SWITCH_DELAY = 1.2; // a load change must hold this long before the pet reacts

function actionsFor(species) {
  const byName = new Map(BASE_ACTS.map(a => [a.name, a]));
  for (const a of species.acts ?? []) byName.set(a.name, a);
  return [...byName.values()];
}

export function createPet(kind, species, host) {
  const acts = actionsFor(species);
  const mult = species.speed ?? 1;
  const base = 'pet' + (species.hop ? ' hop' : '') + (species.waddle ? ' waddle' : '');
  const el = document.createElement('div');
  el.className = base;
  el.innerHTML = `<span class="bubble"></span><span class="zzz">z</span><span class="zzz">z</span>
    <svg viewBox="0 0 46 36"><g class="flip">${species.svg}</g></svg>`;
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

  function loadState(load) {
    const l = load + jitter;
    if (l < 10) return 'sleep';
    if (l < 40) return 'idle';
    if (l < 72 || species.chill) return 'walk';
    return 'run';
  }

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

  function step(dt, load) {
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
      if (act.pose) pose = act.pose === 'sleep' ? 'lie sleep' : 'lie';
    } else {
      target = STATE_SPEED[state];
      if (state === 'sleep') pose = 'lie sleep';
    }
    if (pose) target = 0;

    // ease toward the target speed instead of jumping to it
    v += (target * mult - v) * (1 - Math.exp(-dt * 4));
    if (target === 0 && v < .5) v = 0;
    jumpLeft = Math.max(0, jumpLeft - dt);

    const max = host.offsetWidth - 60;
    x += dir * v * dt;
    if (x > max) { x = max; dir = -1; }
    if (x < 14) { x = 14; dir = 1; }
    el.style.left = x.toFixed(1) + 'px';
    if (dir !== lastDir) { flip.style.transform = dir < 0 ? 'scaleX(-1)' : ''; lastDir = dir; }

    const moving = v > 4;
    const cls = [base, moving && 'moving', v > 90 && 'fast', pose && v < 3 && pose, jumpLeft > 0 && 'jump']
      .filter(Boolean).join(' ');
    if (cls !== lastCls) { el.className = cls; lastCls = cls; }
    if (moving) {
      // legs keep pace with the body: faster walk, shorter step
      const st = (Math.round(Math.min(.6, Math.max(.16, 14 / v)) * 25) / 25).toFixed(2) + 's';
      if (st !== lastStep) { el.style.setProperty('--step', st); lastStep = st; }
    }

    let mood = state === 'idle' ? MOODS[act?.name] ?? MOODS.stand : MOODS[state];
    if (species.chill && load + jitter >= 72) mood = 'Nem aí pra CPU';
    const text = `${species.name} · ${mood} · CPU ${Math.round(load)}%`;
    if (text !== lastMood) { bubble.textContent = text; lastMood = text; }
  }

  return { kind, step, remove: () => el.remove() };
}
