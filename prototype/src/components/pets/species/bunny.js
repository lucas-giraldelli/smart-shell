// Moves by hopping; sometimes lies down.
export default {
  color: '#e2e8f0',
  speed: 1.1,
  hop: true,
  mouth: [42.6, 18.4],   // where it opens its mouth to yawn
  food: '🥕',            // what it eats (Tamagotchi mode)
  acts: [{ name: 'jump', w: 1.5, dur: [.7, 1.1], jump: true }, { name: 'lie', w: 1, dur: [4, 8], pose: 'lie' }, { name: 'binky', w: 1, dur: [1.2, 2.2], pose: 'binky' }, { name: 'nose', w: 1, dur: [1.5, 3], pose: 'nose' }, { name: 'scratch', w: 1, dur: [1.6, 2.4], pose: 'scratch' }, { name: 'talk', w: .5, dur: [1.2, 1.8], say: 'squeak' }],
  poses: {
    // a happy twisting hop
    binky: { move: t => { const q = (t % 1.1) / 1.1; return q < .5 ? { dy: -13 * Math.sin(q * 2 * Math.PI), rot: 22 * Math.sin(q * 4 * Math.PI) } : {}; } },
    // the nose twitches
    nose: { frames: ['a', 'b'], every: .14 },
    // scratches an ear with a hind foot, head tilted, eyes shut
    scratch: { frames: ['a', 'b'], every: .12, shut: true, move: () => ({ rot: -5 }) },
  },
  // what it does for each care action (Tamagotchi mode, poses.js carePose)
  care: {
    // nose twitching fast, one ear flopping down
    pet: { dur: 2, def: { frames: ['a', 'b'], every: .07, shut: true } },
    // nibbles a carrot down to nothing
    feed: { dur: 2.6, def: { frames: ['o', 'c'], every: .1, prop: { svg: '<text font-size="12" text-anchor="middle" dominant-baseline="central">🥕</text>', at: t => { const s = 1 - Math.floor(t / 0.8) * .34; return s > .05 ? { x: 45.6, y: 18.6, s } : null; } } } },
    // a double binky
    play: { pose: 'binky', dur: 2.3 },
    // chews the pill, nose going
    medicine: { pose: 'nose', dur: 2.2, def: { prop: { svg: '<text font-size="8" text-anchor="middle" dominant-baseline="central">💊</text>', at: t => (t > .8 ? null : { x: 42.6 + 8 - t * 7, y: 18.4 - 6 + t * 7 }) } } },
  },
  svg: `
    <g class="legs" fill="#e2e8f0">
      <rect class="la" x="13" y="27" width="5" height="6" rx="2.5" data-hide="scratch"/><rect class="lb" x="18" y="27" width="5" height="6" rx="2.5"/>
      <rect class="lb" x="27" y="27" width="4.5" height="6" rx="2.2"/><rect class="la" x="31.5" y="27" width="4.5" height="6" rx="2.2"/>
    </g>
    <g class="body-g">
      <circle class="tail" style="transform-origin: 50% 50%" cx="9.5" cy="20" r="3.6" fill="#fff"/>
      <path data-pose="scratch:a" d="M15 27 Q22 20 30 14" stroke="#e2e8f0" stroke-width="3.6" fill="none" stroke-linecap="round"/>
      <path data-pose="scratch:b" d="M15 27 Q22 19 29.4 12.6" stroke="#e2e8f0" stroke-width="3.6" fill="none" stroke-linecap="round"/>
      <ellipse cx="22" cy="23" rx="12" ry="8" fill="#f1f5f9"/>
      <ellipse cx="33" cy="4.5" rx="2.6" ry="7" transform="rotate(-12 33 4.5)" fill="#f1f5f9"/>
      <ellipse cx="33" cy="5" rx="1.2" ry="5" transform="rotate(-12 33 5)" fill="#fbcfe8"/>
      <ellipse cx="38.5" cy="4" rx="2.6" ry="7" transform="rotate(10 38.5 4)" fill="#f1f5f9" data-hide="care-pet"/>
      <ellipse cx="38.5" cy="4.5" rx="1.2" ry="5" transform="rotate(10 38.5 4.5)" fill="#fbcfe8" data-hide="care-pet"/>
      <circle cx="36" cy="15" r="7.5" fill="#f1f5f9"/>
      <ellipse class="eye" cx="33.8" cy="14" rx="1.5" ry="2" fill="#1c1917"/><ellipse class="eye" cx="39" cy="14" rx="1.5" ry="2" fill="#1c1917"/><circle class="eye" cx="34.3" cy="13.2" r=".55" fill="#ffffff"/><circle class="eye" cx="39.5" cy="13.2" r=".55" fill="#ffffff"/>
      <path class="closed" d="M32.1 14.4 q1.7 1.3 3.4 0 M37.3 14.4 q1.7 1.3 3.4 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <circle cx="42.6" cy="16.5" r="1" fill="#f472b6" data-hide="nose care-pet"/><circle data-pose="nose:a care-pet:a" cx="42.6" cy="16.5" r="1" fill="#f472b6"/>
      <path d="M41.6 17.7 q.5 .7 1 0 q.5 .7 1 0" stroke="#1c1917" stroke-width=".7" fill="none" stroke-linecap="round"/>
      <circle cx="32.6" cy="17.6" r="1.3" fill="#f9a8d4" opacity=".65"/>
      <circle data-pose="nose:b care-pet:b" cx="42.6" cy="15.8" r="1.1" fill="#f472b6"/>
      <g data-pose="care-clean:a" fill="#e2e8f0"><ellipse cx="35.5" cy="9" rx="1.8" ry="2.4"/><ellipse cx="38" cy="8" rx="1.6" ry="2.2"/></g>
      <g data-pose="care-clean:b" fill="#e2e8f0"><ellipse cx="34.5" cy="4" rx="1.8" ry="2.4"/><ellipse cx="38.5" cy="3" rx="1.6" ry="2.2"/></g>
      <g data-pose="care-pet"><ellipse cx="43" cy="10" rx="2.6" ry="7" transform="rotate(65 43 10)" fill="#f1f5f9"/><ellipse cx="43" cy="10" rx="1.2" ry="5" transform="rotate(65 43 10)" fill="#fbcfe8"/></g>
    </g>`,
};
