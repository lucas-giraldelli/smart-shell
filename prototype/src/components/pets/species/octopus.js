// Wobbles along on its tentacles; changes direction a lot.
export default {
  color: '#c084fc',
  speed: .75,
  mouth: [23.3, 19.6],   // where it opens its mouth to yawn
  food: '🦐',            // what it eats (Tamagotchi mode)
  acts: [{ name: 'turn', w: 2, dur: [.8, 1.6], turn: true }, { name: 'ink', w: 1, dur: [1.6, 2], pose: 'ink' }, { name: 'wave', w: 1.2, dur: [1.6, 2.6], pose: 'wave' }, { name: 'camo', w: 1, dur: [2.4, 3.6], pose: 'camo' }, { name: 'talk', w: .6, dur: [1.2, 1.8], say: 'blub' }],
  poses: {
    // squirts a puff of ink behind it
    ink: { frames: ['a', 'b', 'c', 'c'], every: .4, once: true, move: t => ({ dx: Math.min(4, t * 8) }) },
    // waves a tentacle
    wave: { frames: ['a', 'b'], every: .3 },
    // camouflage: shifts its colour
    camo: { frames: ['a', 'b', 'c', 'b'], every: .5 },
    // asleep: shrinks a little and goes see-through
    sleep: { move: () => ({ opacity: .55, dy: 2 }) },
  },
  // what it does for each care action (Tamagotchi mode, poses.js carePose)
  care: {
    // blushes pink, tentacles rippling
    pet: { pose: 'camo', dur: 2.2, def: { frames: ['b'], move: t => ({ rot: 3 * Math.sin(t * 7) }) } },
    // grabs a shrimp with a tentacle
    feed: { pose: 'wave', dur: 2.6, def: { frames: ['b', 'a', 'a'], every: [.9, .9, .8], once: true,
      prop: { svg: '<text font-size="12" text-anchor="middle" dominant-baseline="central">🦐</text>', at: t => (t < .9 ? { x: 46, y: 10 } : t < 1.8 ? { x: 46 - (t - .9) * 22, y: 10 + (t - .9) * 9, s: 1 - (t - .9) * .6 } : null) } } },
    // juggles three balls
    play: { dur: 3, def: { frames: ['a', 'b', 'c'], every: .2 } },
    // changes colour as it swallows the pill
    medicine: { pose: 'camo', dur: 2.4, def: { frames: ['a', 'b', 'c'], every: .4, prop: { svg: '<text font-size="8" text-anchor="middle" dominant-baseline="central">💊</text>', at: t => (t > .8 ? null : { x: 23.3 + 8 - t * 7, y: 19.6 - 6 + t * 7 }) } } },
  },
  svg: `
    <g class="legs" fill="#a855f7">
      <rect class="la" x="12" y="20" width="4" height="13" rx="2"/><rect class="lb" x="18" y="21" width="4" height="12" rx="2"/>
      <rect class="la" x="24" y="21" width="4" height="12" rx="2"/><rect class="lb" x="30" y="20" width="4" height="13" rx="2" data-hide="wave"/>
    </g>
    <g class="body-g">
      <path d="M10 22 q0 -19 13 -19 q13 0 13 19 q-13 4 -26 0z" fill="#c084fc"/>
      <g data-pose="camo:a" fill="#2dd4bf"><rect x="12" y="20" width="4" height="13" rx="2"/><rect x="18" y="21" width="4" height="12" rx="2"/><rect x="24" y="21" width="4" height="12" rx="2"/><rect x="30" y="20" width="4" height="13" rx="2"/></g>
      <g data-pose="camo:b" fill="#f472b6"><rect x="12" y="20" width="4" height="13" rx="2"/><rect x="18" y="21" width="4" height="12" rx="2"/><rect x="24" y="21" width="4" height="12" rx="2"/><rect x="30" y="20" width="4" height="13" rx="2"/></g>
      <g data-pose="camo:c" fill="#fbbf24"><rect x="12" y="20" width="4" height="13" rx="2"/><rect x="18" y="21" width="4" height="12" rx="2"/><rect x="24" y="21" width="4" height="12" rx="2"/><rect x="30" y="20" width="4" height="13" rx="2"/></g>
      <path data-pose="camo:a" d="M10 22 q0 -19 13 -19 q13 0 13 19 q-13 4 -26 0z" fill="#5eead4"/>
      <path data-pose="camo:b" d="M10 22 q0 -19 13 -19 q13 0 13 19 q-13 4 -26 0z" fill="#f9a8d4"/>
      <path data-pose="camo:c" d="M10 22 q0 -19 13 -19 q13 0 13 19 q-13 4 -26 0z" fill="#fcd34d"/>
      <circle cx="16" cy="9" r="1.6" fill="#e9d5ff" opacity=".7"/><circle cx="19" cy="6" r="1" fill="#e9d5ff" opacity=".7"/>
      <ellipse class="eye" cx="19.5" cy="15" rx="1.6" ry="2.1" fill="#1c1917"/><ellipse class="eye" cx="27" cy="15" rx="1.6" ry="2.1" fill="#1c1917"/>
      <circle class="eye" cx="20" cy="14.2" r=".55" fill="#ffffff"/><circle class="eye" cx="27.5" cy="14.2" r=".55" fill="#ffffff"/>
      <path class="closed" d="M17.8 15.4 q1.7 1.4 3.4 0 M25.3 15.4 q1.7 1.4 3.4 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <circle cx="17" cy="18.4" r="1.3" fill="#f0abfc"/><circle cx="29.5" cy="18.4" r="1.3" fill="#f0abfc"/>
      <path d="M22 18.6 q1.3 1.2 2.6 0" stroke="#1c1917" stroke-width=".8" fill="none" stroke-linecap="round"/>
      <circle data-pose="ink:a" cx="7" cy="27" r="2.4" fill="#312e81" stroke="#a5b4fc" stroke-width=".5"/>
      <g data-pose="ink:b" fill="#312e81" stroke="#a5b4fc" stroke-width=".5" opacity=".9"><circle cx="6" cy="26" r="3.4"/><circle cx="3" cy="29" r="2.4"/></g>
      <g data-pose="ink:c" fill="#312e81" stroke="#a5b4fc" stroke-width=".5" opacity=".6"><circle cx="5" cy="25" r="4.4"/><circle cx="1.5" cy="29" r="3.2"/><circle cx="8" cy="30" r="2.6"/></g>
      <path data-pose="wave:a" d="M32 21 q6 -2 7 -9" stroke="#a855f7" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path data-pose="wave:b" d="M32 21 q7 0 10 -7" stroke="#a855f7" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path data-pose="care-play" d="M10 20 q-6 -4 -5 -12 M36 20 q6 -4 5 -12" stroke="#a855f7" stroke-width="4" fill="none" stroke-linecap="round"/>
      <g data-pose="care-play:a"><circle cx="5" cy="4" r="2" fill="#f87171"/><circle cx="23" cy="-2" r="2" fill="#fde047"/><circle cx="41" cy="4" r="2" fill="#4ade80"/></g>
      <g data-pose="care-play:b"><circle cx="11" cy="-2" r="2" fill="#fde047"/><circle cx="35" cy="-2" r="2" fill="#4ade80"/><circle cx="41" cy="4" r="2" fill="#f87171"/></g>
      <g data-pose="care-play:c"><circle cx="23" cy="-2" r="2" fill="#4ade80"/><circle cx="5" cy="4" r="2" fill="#f87171"/><circle cx="35" cy="-2" r="2" fill="#fde047"/></g>
    </g>`,
};
