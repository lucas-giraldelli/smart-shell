// The pets' behaviour and drawing, ported from the prototype
// (prototype/src/components/pets/engine.js and pets.css). The prototype
// animates the SVG's parts with CSS classes; here each look the CSS can produce
// (legs swung, lying down, eyes closed, at the laptop...) is baked into its own
// SVG string, and the shell swaps images.

import { partsFor, poseOf, yawnPart } from './poses.mjs';
export { frameAt, moveAt, poseOf } from './poses.mjs';

// --- behaviour (engine.js) ---
// A pet reacts to CPU load: sleep (< 10%) · idle (< 40%) · walk (< 72%) · run.
// While idle it picks weighted actions; each species adds or overrides actions
// through `acts` and can set speed / hop / waddle / chill (never runs). During
// a work meeting every pet stops in front of a laptop and types; while YouTube
// Music plays every pet dances its own dance (DANCES below).
const BASE_ACTS = [
  { name: 'stand', w: 3, dur: [2, 5] },
  { name: 'stroll', w: 4, dur: [3, 7], speed: 26 },
  { name: 'turn', w: 1, dur: [.8, 1.5], turn: true },
];
const STATE_SPEED = { sleep: 0, walk: 34, run: 150 };
const SWITCH_DELAY = 1.2; // a load change must hold this long before the pet reacts

function actionsFor(species) {
  const byName = new Map(BASE_ACTS.map(a => [a.name, a]));
  for (const a of species.acts ?? []) byName.set(a.name, a);
  return [...byName.values()];
}

// step(dt, load, activity, width, opts) -> { x, dir, moving, fast, pose, own, poseT, say, jump, step, mood }
// (own: the species' own pose playing, poseT seconds in; say: a pets.says key)
// opts: { cpu: config thresholds.cpu, heavy: 0 | 1 | 2 (free RAM warn / crit: slower),
//         groove: 0..1 while dancing }
// (`mood` is a translation key under pets.moods, or 'chill')
export function createPet(species, width) {
  const acts = actionsFor(species);
  const mult = species.speed ?? 1;
  // each pet reacts at slightly different loads, so they don't all switch at once
  const jitter = (Math.random() - .5) * 12;
  let x = 20 + Math.random() * Math.max(0, width - 100);
  let dir = Math.random() < .5 ? -1 : 1, v = 0;
  let state = 'idle', pending = null, pendingT = 0;
  let act = null, actLeft = 0, actT = 0, jumpLeft = 0, yawnLeft = 0, lastState = 'idle';
  // walking, it stops every 6-14 s for one of its tricks (an action with a pose or a word)
  const tricks = acts.filter(a => (a.pose && a.pose !== 'lie' && a.pose !== 'sleep') || a.say);
  let trick = null, trickLeft = 0, trickT = 0, trickIn = 6 + Math.random() * 8;

  // config thresholds.cpu: below `sleep` it sleeps, below `idle` it idles,
  // below `walk` it walks, above it runs
  let cpu = { sleep: 10, idle: 40, walk: 72 };
  function loadState(load) {
    const l = load + jitter;
    if (l < cpu.sleep) return species.sleepless ? 'idle' : 'sleep';
    if (l < cpu.idle) return 'idle';
    if (l < cpu.walk || species.chill) return 'walk';
    return 'run';
  }

  // dancing, every 1.5-4 s it does something: turns around (half the time),
  // takes a few steps (a third) or just keeps dancing; opts.groove (0..1, how
  // loud the music is) makes that more often, and the steps longer and faster
  // (a run near the top)
  let danceNextIn = 1.5 + Math.random() * 2.5, danceWalkLeft = 0;
  // a song just started: it stops and looks left and right before it dances
  let listenFlip = 0;

  function pickAct() {
    let r = Math.random() * acts.reduce((t, a) => t + a.w, 0);
    act = acts.find(a => (r -= a.w) < 0) ?? acts[0];
    actLeft = act.dur[0] + Math.random() * (act.dur[1] - act.dur[0]);
    actT = 0;
    if (act.turn) dir = -dir;
    if (act.jump) jumpLeft = .55;
  }

  function step(dt, load, activity, w, opts = {}) {
    if (opts.cpu) cpu = opts.cpu;
    const want = loadState(load);
    if (want === state) pending = null;
    else {
      if (pending !== want) { pending = want; pendingT = 0; }
      if ((pendingT += dt) > SWITCH_DELAY) { state = want; pending = null; act = null; }
    }

    // falling asleep: a 1.6 s yawn first
    if (state === 'sleep' && lastState !== 'sleep') yawnLeft = 1.6;
    lastState = state;
    yawnLeft = Math.max(0, yawnLeft - dt);

    let target, pose = '';
    if (state === 'idle') {
      if (!act || (actLeft -= dt) <= 0) pickAct();
      else actT += dt;
      target = act.speed ?? 0;
      if (act.pose) pose = act.pose === 'sleep' ? 'lie sleep' : act.pose;
    } else {
      target = STATE_SPEED[state];
      if (state === 'sleep') pose = 'lie sleep';
    }
    if (state === 'walk' && !activity && tricks.length) {
      if (trick && (trickLeft -= dt) <= 0) trick = null;
      else if (trick) trickT += dt;
      else if ((trickIn -= dt) <= 0) {
        trickIn = 6 + Math.random() * 8;
        let r = Math.random() * tricks.reduce((t, a) => t + a.w, 0);
        trick = tricks.find(a => (r -= a.w) < 0) ?? tricks[0];
        trickLeft = trick.dur[0] + Math.random() * (trick.dur[1] - trick.dur[0]);
        trickT = 0;
        if (trick.turn) dir = -dir;
        if (trick.jump) jumpLeft = .55;
      }
    } else trick = null;
    if (trick) {
      target = trick.speed ?? 0;
      if (trick.pose) pose = trick.pose;
    }
    // what it's doing now: the idle action, or the trick it stopped for
    const cur = state === 'idle' ? act : trick, curT = state === 'idle' ? actT : trickT;
    if (activity === 'work') pose = 'work';
    else if (activity === 'dance') pose = 'dance';
    // the species' own pose (poses.js); one with a speed moves while it plays.
    // Its `sleep` pose, if any, replaces the plain lying down
    const own = cur && pose && cur.pose && pose.split(' ').includes(cur.pose) && poseOf(species, cur.pose) ? cur.pose
      : state === 'sleep' && !activity && yawnLeft > 0 ? 'yawn'
      : state === 'sleep' && !activity && poseOf(species, 'sleep') ? 'sleep' : '';
    if (own === 'yawn') pose = 'yawn';
    if (pose && !(own && act?.speed)) target = 0;
    // a word in a speech bubble (act.say, a key under pets.says)
    const say = cur && !activity && cur.say ? cur.say : '';
    if (activity === 'listen') {
      target = 0;
      if ((listenFlip -= dt) <= 0) { dir = -dir; listenFlip = .4 + Math.random() * .25; }
    } else listenFlip = .15;
    if (activity === 'dance') {
      const g = opts.groove ?? .6;
      if (danceWalkLeft > 0) {
        danceWalkLeft -= dt;
        target = 25 + 110 * g * g;
      } else if ((danceNextIn -= dt) <= 0) {
        danceNextIn = (1.5 + Math.random() * 2.5) * (1.3 - .6 * g);
        const r = Math.random();
        if (r < .5) dir = -dir;
        else if (r < .83) {
          if (Math.random() < .5) dir = -dir;
          danceWalkLeft = 1.2 + Math.random() * 2.3;   // a short to a long stroll
        }
      }
    }

    // ease toward the target speed instead of jumping to it; low free RAM
    // makes it heavy and slow
    const heavy = opts.heavy ? .6 : 1;
    v += (target * mult * heavy - v) * (1 - Math.exp(-dt * 4));
    if (target === 0 && v < .5) v = 0;
    jumpLeft = Math.max(0, jumpLeft - dt);

    const max = w - 60;
    x += dir * v * dt;
    if (x > max) { x = max; dir = -1; }
    if (x < 14) { x = 14; dir = 1; }

    const moving = v > 4;
    let mood = activity === 'work' || activity === 'dance' ? activity : state === 'idle' ? act?.name ?? 'stand' : trick ? trick.name : state;
    if (species.chill && load + jitter >= 72) mood = 'chill';
    return {
      x, dir, moving, fast: v > 90, pose: pose === 'dance' || own || (pose && v < 3) ? pose : '', jump: jumpLeft > 0,
      own, poseT: own === 'yawn' ? 1.6 - yawnLeft : own ? curT : 0, say,
      // legs keep pace with the body: faster walk, shorter step
      step: moving ? Math.round(Math.min(.6, Math.max(.16, 14 / v)) * 25) / 25 : .42,
      mood,
    };
  }

  return { step };
}

// --- drawing (pets.css) ---
// drawn in front of every pet, shown only during a work meeting
const LAPTOP = (screen) => `
  <g class="laptop">
    <rect x="40" y="18.5" width="12" height="9" rx="1.2" fill="#1f2937" stroke="#94a3b8" stroke-width=".6"/>
    <rect class="screen" x="41.2" y="19.7" width="9.6" height="6.6" rx=".6" fill="${screen}"/>
    <rect x="37.5" y="27.6" width="16" height="2" rx="1" fill="#94a3b8"/>
  </g>`;
export const SCREEN_COLORS = ['#7dd3fc', '#a5f3fc', '#93c5fd', '#bae6fd'];

const drop = (svg, cls) => svg.replace(new RegExp(`<[a-z]+ class="${cls}[^"]*"[^>]*/>`, 'g'), '');

// One look of a sprite as an SVG data URL:
//   leg     -1 / 0 / 1: legs swung back, straight, forward (legA / legB, 28deg)
//   lie     legs hidden, body 5px lower
//   closed  eyes closed (sleep, or a blink)
//   tongue  the frog's tongue out
//   pouch   the frog's throat pouch scale (croak)
//   bob     body raised (fast run, typing)
//   screen  the laptop's screen colour, or '' for no laptop
//   wag     the tail's angle (deg), turned around where it starts (its path's M)
//   pose / frame  the species' own pose playing and its frame (poses.js)
export function look(species, opts) {
  const key = JSON.stringify(opts);
  if (!species.__looks) species.__looks = new Map();
  if (species.__looks.has(key)) return species.__looks.get(key);
  const { leg = 0, lie = false, closed = false, tongue = false, pouch = 1, bob = 0, screen = '', wag = 0, pose = '', frame = '' } = opts;
  let svg = partsFor(species.svg + yawnPart(species), pose, frame);
  if (wag) svg = svg.replace(/<path class="tail" d="M\s*([\d.]+)[ ,]([\d.]+)/, (m, x, y) => `<path class="tail" transform="rotate(${wag} ${x} ${y})" d="M${x} ${y}`);
  if (leg) {
    svg = svg.replace(/<rect class="(la|lb)" x="([\d.]+)" y="([\d.]+)" width="([\d.]+)"([^>]*)\/>/g,
      (_, cls, x, y, w, rest) => {
        const a = (cls === 'la' ? 28 : -28) * leg;
        const cx = +x + w / 2;
        return `<rect class="${cls}" x="${x}" y="${y}" width="${w}"${rest} transform="rotate(${a} ${cx} ${y})"/>`;
      });
  }
  if (lie) svg = svg.replace(/<g class="legs"[\s\S]*?<\/g>/, '');
  const lift = (lie ? 5 : 0) - bob;
  if (lift) svg = svg.replace('<g class="body-g"', `<g class="body-g" transform="translate(0 ${lift})"`);
  svg = closed ? drop(svg, 'eye') : drop(svg, 'closed');
  if (!tongue) svg = drop(svg, 'tongue');
  if (pouch !== 1) {
    svg = svg.replace(/<ellipse class="pouch" cx="([\d.]+)" cy="([\d.]+)" rx="([\d.]+)" ry="([\d.]+)"/,
      (m, cx, cy, rx, ry) => {
        // transform-origin 20% 30% of the pouch
        const ox = cx - rx + 0.4 * rx, oy = cy - ry + 0.6 * ry;
        return `${m} transform="translate(${ox} ${oy}) scale(${pouch}) translate(${-ox} ${-oy})"`;
      });
  }
  if (screen) svg += LAPTOP(screen);
  // 10px wider than the 46px sprite box: the laptop reaches x 53.5 (the
  // prototype's svg overflows visibly)
  const url = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 36">${svg}</svg>`);
  species.__looks.set(key, url);
  return url;
}

// --- dancing (pets.css .pet.dance) ---
// One beat = 0.5 s (~120 bpm). Each species moves the whole sprite its own way:
// dx / dy in px, rot in degrees around its feet; `beats` is the loop length.
const tri = p => 1 - Math.abs(1 - 2 * p);           // 0 -> 1 -> 0 over a loop
const wave = p => Math.sin(p * Math.PI * 2);         // -1 .. 1
export const DANCES = {
  cat: { beats: 2, at: p => ({ rot: -8 * Math.cos(p * Math.PI * 2) }) },               // sway
  shiba: { beats: 1, at: p => ({ dy: -5 * tri(p) }) },                                   // bounce
  fox: { beats: 2, at: p => ({ dx: -3 * Math.cos(p * Math.PI * 2), rot: -4 * Math.cos(p * Math.PI * 2) }) }, // side-step
  penguin: { beats: 2, at: p => ({ rot: -12 * Math.cos(p * Math.PI * 2) }) },           // a big waddle
  bunny: { beats: 1, at: p => ({ dy: p < .4 ? -8 * (p / .4) : -8 * (1 - (p - .4) / .6) }) }, // skip
  capy: { beats: 4, at: p => ({ rot: -4 * Math.cos(p * Math.PI * 2), dy: -2 * tri(p) }) }, // half-time nod
  frog: { beats: 2, at: p => ({ dx: -4 * Math.cos(p * Math.PI * 2), dy: -6 * Math.abs(wave(p)) }) }, // side hops
  duck: { beats: 1.6, at: p => ({ rot: -12 * Math.cos(p * Math.PI * 2) }) },          // a quick waddle
  corgi: { beats: .8, at: p => ({ dy: -5 * tri(p) }) },                                // bounces double time
  panda: { beats: 4, at: p => ({ rot: -4 * Math.cos(p * Math.PI * 2), dy: -2 * tri(p) }) }, // slow nod
  owl: { beats: 1.6, at: p => ({ rot: -8 * Math.cos(p * Math.PI * 2) }) },            // head-bob sway
  turtle: { beats: 6, at: p => ({ rot: -4 * Math.cos(p * Math.PI * 2), dy: -2 * tri(p) }) }, // the slowest groove
  octopus: { beats: 1, at: p => ({ rot: -6 * Math.cos(p * Math.PI * 2), dy: -3 * tri(p) }) }, // wiggles
  macaw: { beats: 1, at: p => ({ dy: p < .4 ? -8 * (p / .4) : -8 * (1 - (p - .4) / .6) }) }, // hops on the beat
  anteater: { beats: 2.4, at: p => ({ dx: -3 * Math.cos(p * Math.PI * 2), rot: -4 * Math.cos(p * Math.PI * 2) }) }, // side to side
  ghost: { beats: 2, at: p => ({ dy: -6 + -3 * Math.cos(p * Math.PI * 2), rot: -6 * Math.cos(p * Math.PI * 2) }) }, // floats and sways
  blackcat: { beats: 2, at: p => ({ rot: -8 * Math.cos(p * Math.PI * 2) }) },         // sways
  pig: { beats: 1, at: p => ({ dx: -2 * Math.cos(p * Math.PI * 2), dy: -4 * tri(p) }) }, // a trotting bounce
};
