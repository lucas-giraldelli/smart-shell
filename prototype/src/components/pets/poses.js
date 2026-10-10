// A species' own idle poses (`poses` in its file), shared by the prototype's
// engine and the shell's (shell/lib/poses.mjs links here). An action with
// `pose: 'lick'` plays the species' `poses.lick` while it lasts:
//   frames  frame ids, `every` seconds each (a number, or one per frame);
//           `once` holds the last frame instead of looping
//   move(t) moves the whole sprite, t = seconds into the pose:
//           { dx, dy, rot (deg, around its feet), opacity, flip (faces back) }
//   shut    eyes closed · low: legs hidden, body lowered (like lying down)
//   prop    an object of its own, outside the sprite (not turned or moved with
//           it): { svg (drawn around 0,0), at(t) -> { x, y } in sprite units, or null }
// In the species' SVG, data-pose="lick" shows an element only during that
// pose, data-pose="lick:b fly:2" only on those frames, and data-hide="lick" (or
// "lick:b") hides it during the pose (or that frame). Such elements can't nest a tag of their own kind.

export function frameAt(def, t) {
  const frames = def?.frames ?? [];
  if (!frames.length) return '';
  const every = def.every ?? .3;
  if (Array.isArray(every)) {
    const total = every.reduce((a, b) => a + b, 0);
    let r = def.once ? Math.min(t, total - 1e-6) : t % total;
    for (let i = 0; i < frames.length; i++) if ((r -= every[i]) < 0) return frames[i];
    return frames[frames.length - 1];
  }
  const i = Math.floor(t / every);
  return frames[def.once ? Math.min(i, frames.length - 1) : i % frames.length];
}

export const moveAt = (def, t) => (def?.move ? def.move(t) : {});

const shows = (attr, pose, frame) => attr.split(' ').some(a => a === pose || a === `${pose}:${frame}`);
const hides = (attr, pose, frame) => attr.split(' ').some(a => a === pose || a === `${pose}:${frame}`);

// the SVG with only this pose's (and frame's) parts - the shell bakes it
export function partsFor(svg, pose = '', frame = '') {
  return svg.replace(/<([a-z]+)\b([^>]*?)\sdata-(pose|hide)="([^"]*)"([^>]*?)(\/>|>[\s\S]*?<\/\1>)/g,
    (m, tag, a, kind, attr) => ((kind === 'pose' ? shows(attr, pose, frame) : !hides(attr, pose, frame)) ? m : ''));
}

// the same on the prototype's live SVG
export function showParts(root, pose = '', frame = '') {
  for (const n of root.querySelectorAll('[data-pose]')) n.style.display = shows(n.dataset.pose, pose, frame) ? '' : 'none';
  for (const n of root.querySelectorAll('[data-hide]')) n.style.display = hides(n.dataset.hide, pose, frame) ? 'none' : '';
}

// Every pet yawns as it falls asleep (and the turtle as an idle): eyes shut,
// a stretch up, a mouth opened at the species' `mouth` point
export const YAWN = {
  frames: ['o'], shut: true,
  move: t => { const k = Math.sin(Math.min(1, t / 1.6) * Math.PI); return { dy: -1.5 * k, rot: -4 * k }; },
};
export const poseOf = (species, name) => species.poses?.[name] ?? (name === 'yawn' ? YAWN : null);
// parts every species gets: its open mouth (yawning, eating, taking a pill;
// frame `o`) at its `mouth` point, and bath bubbles around its body (frames
// `a` / `b` of a wash; a species' own bath reuses them with name: 'wash')
export function yawnPart(species) {
  const bubble = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" fill-opacity=".35" stroke="#fff" stroke-width=".5"/>`;
  const bubbles = `<g data-pose="wash:a">${[[9, 15, 2.4], [20, 9, 1.8], [31, 12, 2.2], [14, 25, 1.6], [37, 22, 2]].map(b => bubble(b[0], b[1], b[2])).join('')}</g>`
    + `<g data-pose="wash:b">${[[10, 12, 2], [21, 7, 2.2], [32, 9, 1.7], [13, 22, 2.1], [38, 19, 1.6]].map(b => bubble(b[0], b[1], b[2])).join('')}</g>`;
  if (!species.mouth) return bubbles;
  const [x, y] = species.mouth;
  const open = 'yawn eat:o pill:o care-feed:o care-medicine:o';
  return `<ellipse data-pose="${open}" cx="${x}" cy="${y}" rx="1.4" ry="1.9" fill="#1c1917"/>`
    + `<ellipse data-pose="${open}" cx="${x}" cy="${y + .8}" rx=".8" ry=".8" fill="#f472b6"/>` + bubbles;
}

// --- care (Tamagotchi mode) ---
// What a pet does for a care action: its species' own `care[action]`
// ({ dur, say, def, and name to borrow a plain pose's parts }), else the plain one below. `glyph` is what it eats.
// Props drawn as emoji: an SVG <text> centred on the prop's point.
export const emoji = (glyph, size = 9) => `<text font-size="${size}" text-anchor="middle" dominant-baseline="central">${glyph}</text>`;
const PLAIN = {
  // chews its food at its mouth, a bite at a time
  feed: (sp, glyph) => {
    const [mx, my] = sp.mouth ?? [40, 16];
    return { name: 'eat', dur: 2.4, def: { frames: ['o', 'c'], every: .22, move: t => ({ dy: .8 * Math.sin(t * 14) }),
      prop: { svg: emoji(glyph), at: t => { const s = 1 - Math.floor(t / .7) * .34; return s > .05 ? { x: mx + 4, y: my + .5, s } : null; } } } };
  },
  // a ball bouncing in front of it, and it hops after it
  play: () => ({ name: 'play', dur: 2.6, def: {
    move: t => ({ dy: -6 * Math.abs(Math.sin(t * 5)), flip: Math.floor(t / 1.3) % 2 === 1 }),
    prop: { svg: emoji('🎾', 8), at: t => ({ x: 50 - (t % 1.3) * 3, y: 30 - 12 * Math.abs(Math.sin(t * 5 + 1.2)), s: 1 }) } } }),
  // eyes shut, wiggling with joy (the hearts come from pets.js)
  pet: () => ({ name: 'love', dur: 1.8, def: { shut: true, move: t => ({ rot: 4 * Math.sin(t * 9) }) } }),
  // a soap bar scrubs it in zigzags, foam all over, eyes shut; then a shake
  clean: () => ({ name: 'wash', dur: 3, def: {
    frames: ['a', 'b'], every: .3, shut: true,
    move: t => (t < 2.3 ? { rot: 1.5 * Math.sin(t * 9) } : { dx: 1.6 * Math.sin(t * 60) }),
    prop: { svg: emoji('🧼', 8), at: t => (t > 2.2 ? null : { x: 23 + 12 * Math.sin(t * 4.2), y: 18 + 5 * Math.sin(t * 8.4) }) },
  } }),
  // the pill flies into its open mouth, a gulp, a happy hop
  medicine: sp => {
    const [mx, my] = sp.mouth ?? [40, 16];
    return { name: 'pill', dur: 2, def: { frames: ['o', 'o', 'c'], every: [.5, .3, 1.2], once: true,
      prop: { svg: emoji('💊', 8), at: t => (t > .8 ? null : { x: mx + 8 - t * 7, y: my - 6 + t * 7, s: 1 }) },
      move: t => (t > 1 ? { dy: -3 * Math.abs(Math.sin((t - 1) * 8)) } : {}) } };
  },
};
//   own.pose borrows one of its poses (its parts and def); own.def then only
//   adds to it (a prop, a speed...)
export function carePose(species, action, glyph) {
  const own = species.care?.[action];
  if (own && own.pose) {
    return Object.assign({}, own, { name: own.pose, def: Object.assign({}, poseOf(species, own.pose), own.def || {}) });
  }
  if (own) return Object.assign({ name: `care-${action}` }, own);   // own.name wins
  const plain = PLAIN[action];
  return plain ? plain(species, glyph) : null;
}
