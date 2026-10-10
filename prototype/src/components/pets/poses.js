// A species' own idle poses (`poses` in its file), shared by the prototype's
// engine and the shell's (shell/lib/poses.mjs links here). An action with
// `pose: 'lick'` plays the species' `poses.lick` while it lasts:
//   frames  frame ids, `every` seconds each (a number, or one per frame);
//           `once` holds the last frame instead of looping
//   move(t) moves the whole sprite, t = seconds into the pose:
//           { dx, dy, rot (deg, around its feet), opacity, flip (faces back) }
//   shut    eyes closed · low: legs hidden, body lowered (like lying down)
// In the species' SVG, data-pose="lick" shows an element only during that
// pose, data-pose="lick:b fly:2" only on those frames, and data-hide="lick"
// hides it during the pose. Such elements can't nest a tag of their own kind.

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
const hides = (attr, pose) => attr.split(' ').includes(pose);

// the SVG with only this pose's (and frame's) parts - the shell bakes it
export function partsFor(svg, pose = '', frame = '') {
  return svg.replace(/<([a-z]+)\b([^>]*?)\sdata-(pose|hide)="([^"]*)"([^>]*?)(\/>|>[\s\S]*?<\/\1>)/g,
    (m, tag, a, kind, attr) => ((kind === 'pose' ? shows(attr, pose, frame) : !hides(attr, pose)) ? m : ''));
}

// the same on the prototype's live SVG
export function showParts(root, pose = '', frame = '') {
  for (const n of root.querySelectorAll('[data-pose]')) n.style.display = shows(n.dataset.pose, pose, frame) ? '' : 'none';
  for (const n of root.querySelectorAll('[data-hide]')) n.style.display = hides(n.dataset.hide, pose) ? 'none' : '';
}

// Every pet yawns as it falls asleep (and the turtle as an idle): eyes shut,
// a stretch up, a mouth opened at the species' `mouth` point
export const YAWN = {
  frames: ['o'], shut: true,
  move: t => { const k = Math.sin(Math.min(1, t / 1.6) * Math.PI); return { dy: -1.5 * k, rot: -4 * k }; },
};
export const poseOf = (species, name) => species.poses?.[name] ?? (name === 'yawn' ? YAWN : null);
export function yawnPart(species) {
  if (!species.mouth) return '';
  const [x, y] = species.mouth;
  return `<ellipse data-pose="yawn" cx="${x}" cy="${y}" rx="1.4" ry="1.9" fill="#1c1917"/><ellipse data-pose="yawn" cx="${x}" cy="${y + .8}" rx=".8" ry=".8" fill="#f472b6"/>`;
}
