// Very slow; doesn't care about the CPU at all.
export default {
  color: '#16a34a',
  speed: .35,
  chill: true,
  mouth: [45.8, 22.6],   // where it opens its mouth to yawn
  food: '🥬',            // what it eats (Tamagotchi mode)
  pace: { food: .6, fun: .6, energy: .6, clean: .6 },   // how fast its needs run down against the default 1
  acts: [{ name: 'stand', w: 5, dur: [3, 7] }, { name: 'nap', w: 2, dur: [8, 14], pose: 'sleep' }, { name: 'hide', w: 1.2, dur: [3, 5], pose: 'hide' }, { name: 'talk', w: .6, dur: [1.6, 2.4], say: 'slow' }, { name: 'yawn', w: .8, dur: [1.6, 1.8], pose: 'yawn' }],
  poses: {
    // hides in its shell, then peeks out
    hide: { frames: ['a', 'a', 'a', 'b', 'b', 'a'], every: .5, move: () => ({ dy: 5 }) },
    // asleep inside its shell
    sleep: { move: () => ({ dy: 0 }) },
  },
  // what it does for each care action (Tamagotchi mode, poses.js carePose)
  care: {
    // stretches its neck out for a pat
    pet: { dur: 2.2, def: { shut: true, move: t => ({ rot: -5 * Math.min(1, t / .5), dx: 1 }) } },
    // bites its lettuce, slowly
    feed: { dur: 3.2, def: { frames: ['o', 'c'], every: .5, prop: { svg: '<text font-size="9" text-anchor="middle" dominant-baseline="central">🥬</text>', at: t => { const s = 1 - Math.floor(t / 1) * .34; return s > .05 ? { x: 50, y: 22.6, s } : null; } } } },
    // ambles round in a slow circle
    play: { dur: 3.6, def: { move: t => ({ dx: 6 * Math.sin(t * 1.4), flip: Math.cos(t * 1.4) < 0 }) } },
    // ducks into its shell with the pill, then peeks out
    medicine: { pose: 'hide', dur: 3, def: { prop: { svg: '<text font-size="8" text-anchor="middle" dominant-baseline="central">💊</text>', at: t => (t > .8 ? null : { x: 50 - t * 8, y: 14 + t * 8 }) } } },
  },
  svg: `
    <g class="legs" fill="#65a30d" data-hide="hide sleep">
      <rect class="la" x="11" y="26" width="5" height="7" rx="2.5"/><rect class="lb" x="16.5" y="26" width="5" height="7" rx="2.5"/>
      <rect class="lb" x="26" y="26" width="5" height="7" rx="2.5"/><rect class="la" x="31.5" y="26" width="5" height="7" rx="2.5"/>
    </g>
    <g class="body-g">
      <path class="tail" d="M9 25 l-4 1.5 l4 1.5z" fill="#65a30d" data-hide="hide sleep"/>
      <rect x="35" y="19.5" width="7" height="6.5" rx="3" fill="#84cc16" data-hide="hide sleep"/>
      <path d="M8 27 q15 -22 31 0z" fill="#16a34a"/>
      <path d="M13 26 q3 -7 8 -9 M21 17 q5 3 6 9 M17 26 q4 -5 4 -9 M26 21 q4 1 7 5" stroke="#4ade80" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <path d="M17 19.5 q6 -4.5 12 0" stroke="#86efac" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".7"/>
      <path d="M7.5 27 q16 3 32 0" stroke="#a3e635" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="42" cy="19.5" rx="6.5" ry="5.5" fill="#84cc16" data-hide="hide sleep"/>
      <ellipse class="eye" cx="43.6" cy="18.4" rx="1.5" ry="1.9" fill="#1c1917" data-hide="hide sleep"/><circle class="eye" cx="44.1" cy="17.6" r=".55" fill="#ffffff" data-hide="hide sleep"/>
      <path class="closed" d="M41.9 18.8 q1.7 1.3 3.4 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round" data-hide="hide sleep"/>
      <path data-hide="hide sleep" d="M44.4 22 q1.4 1 2.8 0" stroke="#1c1917" stroke-width=".8" fill="none" stroke-linecap="round"/>
      <circle data-hide="hide sleep" cx="41" cy="21.6" r="1.2" fill="#fb7185" opacity=".5"/>
      <circle data-pose="hide:b" cx="38.6" cy="23.6" r="1" fill="#1c1917"/><circle data-pose="hide:b" cx="36.4" cy="23.6" r="1" fill="#1c1917"/>
    </g>`,
};
