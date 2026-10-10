// Lies down and naps between strolls.
export default {
  color: '#f2a65a',
  mouth: [39.4, 17.8],   // where it opens its mouth to yawn
  acts: [{ name: 'lie', w: 2, dur: [5, 10], pose: 'lie' }, { name: 'nap', w: 1, dur: [6, 12], pose: 'sleep' }, { name: 'lick', w: 1.2, dur: [2, 3.5], pose: 'lick' }, { name: 'talk', w: .7, dur: [1.4, 2], say: 'meow' }, { name: 'stretch', w: 1, dur: [1.8, 2.6], pose: 'stretch' }],
  poses: {
    // licks a raised paw, eyes shut
    lick: { frames: ['a', 'b'], every: .28, shut: true, move: t => ({ rot: -1.5 * Math.sin(t * 11) }) },
    // a long stretch: front low, rear up, eyes shut
    stretch: { shut: true, move: t => { const k = Math.sin(Math.min(1, t / .7) * Math.PI / 2); return { rot: 9 * k, dy: 1.5 * k }; } },
    // asleep curled into a ball, tail over its nose
    sleep: {},
  },
  // what it does for each care action (Tamagotchi mode, poses.js carePose)
  care: {
    // purrs: eyes shut, tail going, a tiny rumble
    pet: { dur: 2, say: 'purr', def: { shut: true, tailFast: true, move: t => ({ dx: .4 * Math.sin(t * 50) }) } },
    // its fish, a bite at a time, then licks its lips
    feed: { dur: 2.6, def: {
      frames: ['o', 'c', 'o', 'c', 'o', 'c', 'l', 'c'], every: .32, once: true,
      prop: { svg: '<text font-size="9" text-anchor="middle" dominant-baseline="central">🐟</text>', at: t => { const s = 1 - Math.floor(t / .64) * .34; return s > .05 ? { x: 43.4, y: 18.3, s } : null; } },
    } },
    // crouches, wiggles and pounces on a ball of yarn
    play: { dur: 2.6, def: {
      move: t => (t < 1 ? { dy: 1.5, rot: -4, dx: .6 * Math.sin(t * 30) } : t < 1.6 ? { dy: -10 * Math.sin((t - 1) / .6 * Math.PI), dx: 6 * (t - 1) / .6, rot: 8 * (t - 1) / .6 } : { dx: 6, rot: 4 }),
      prop: { svg: '<text font-size="8" text-anchor="middle" dominant-baseline="central">🧶</text>', at: t => ({ x: Math.max(48, 56 - t * 6), y: 31.5 }) },
    } },
    // grooms itself: licks a paw and washes its face
    clean: { dur: 2.6, def: { frames: ['a', 'b'], every: .28, shut: true, move: t => ({ rot: -1.5 * Math.sin(t * 11) }) } },
    // the pill hidden in a fish
    medicine: { dur: 2.4, def: {
      frames: ['o', 'c'], every: .3,
      prop: { svg: '<text font-size="9" text-anchor="middle" dominant-baseline="central">🐟</text>', at: t => { const s = 1 - Math.floor(t / .7) * .34; return s > .05 ? { x: 43.4, y: 18.3, s } : null; } },
    } },
  },
  svg: `
    <g class="legs" fill="#d9823c">
      <rect class="la" x="12" y="24" width="4" height="9" rx="2"/><rect class="lb" x="17" y="24" width="4" height="9" rx="2"/>
      <rect class="lb" x="28" y="24" width="4" height="9" rx="2"/><rect class="la" x="33" y="24" width="4" height="9" rx="2" data-hide="lick care-clean"/>
    </g>
    <g class="body-g">
      <path class="tail" data-hide="sleep" d="M10 21 C3 20 1 12 5 7" stroke="#e8914a" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="23" cy="22" rx="14" ry="8" fill="#f2a65a"/>
      <ellipse cx="25" cy="26.5" rx="8" ry="3" fill="#fde7cf"/>
      <path d="M18 14.8 v3 M22.5 14.2 v3.4 M27 14.8 v3" stroke="#d9823c" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <polygon points="31,8 32,1 37,6" fill="#e8914a"/><polygon points="39,6 44,1 44,10" fill="#e8914a"/>
      <polygon points="32.3,6.8 32.9,3.2 35.4,5.6" fill="#fbcfe8"/><polygon points="40.2,6 43,3 43,8.2" fill="#fbcfe8"/>
      <circle cx="37" cy="13" r="8" fill="#f2a65a"/>
      <ellipse cx="39.4" cy="16.8" rx="4" ry="2.6" fill="#fde7cf"/>
      <ellipse class="eye" cx="34.8" cy="12" rx="1.6" ry="2.1" fill="#1c1917"/><ellipse class="eye" cx="40.8" cy="12" rx="1.6" ry="2.1" fill="#1c1917"/><circle class="eye" cx="35.3" cy="11.2" r=".55" fill="#ffffff"/><circle class="eye" cx="41.3" cy="11.2" r=".55" fill="#ffffff"/>
      <path class="closed" d="M33.0 12.4 q1.8 1.3 3.6 0 M39.0 12.4 q1.8 1.3 3.6 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <path d="M39.4 15.2 l-.9 .9 h1.8z" fill="#f472b6"/>
      <path d="M38 16.7 q.7 .8 1.4 0 q.7 .8 1.4 0" stroke="#1c1917" stroke-width=".8" fill="none" stroke-linecap="round"/>
      <circle cx="33" cy="15.6" r="1.2" fill="#f9a8d4" opacity=".65"/><circle cx="44" cy="15.2" r="1.2" fill="#f9a8d4" opacity=".65"/>
      <path data-pose="lick care-clean" d="M33.5 26 Q37 23.5 40.6 20.4" stroke="#d9823c" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse data-pose="lick care-clean" cx="41.2" cy="19.6" rx="2.3" ry="2" fill="#f2a65a"/>
      <ellipse data-pose="lick:b care-clean:b care-feed:l" cx="40" cy="18.2" rx="1.1" ry=".8" fill="#f472b6"/>
      <path data-pose="sleep" d="M10 22 Q8 31 22 31 Q34 31 40 25" stroke="#e8914a" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>`,
};
