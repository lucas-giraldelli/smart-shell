// Never runs, whatever the CPU does. Mostly lies down.
export default {
  color: '#a0703f',
  speed: .55,
  chill: true,
  mouth: [42.2, 18.4],   // where it opens its mouth to yawn
  food: '🍊',            // what it eats (Tamagotchi mode)
  pace: { food: .7, fun: .6, energy: .7, clean: .7 },   // how fast its needs run down against the default 1
  acts: [{ name: 'lie', w: 4, dur: [6, 14], pose: 'lie' }, { name: 'nap', w: 2, dur: [8, 16], pose: 'sleep' }, { name: 'bath', w: 1.6, dur: [6, 10], pose: 'bath' }, { name: 'talk', w: .6, dur: [2, 3], say: 'pullup' }],
  poses: {
    // a hot bath: sits in the water, eyes shut, its orange floats beside it
    bath: { frames: ['a', 'b'], every: .9, shut: true, low: true },
    // asleep in the water, its orange floating beside it
    sleep: { low: true },
  },
  // what it does for each care action (Tamagotchi mode, poses.js carePose)
  care: {
    // zen: eyes shut, its orange bobbing
    pet: { dur: 2.2, def: { frames: ['a', 'b'], every: .4, shut: true } },
    // eats the orange off its head; a new one grows back
    feed: { dur: 3, def: {
      frames: ['x', 'x', 'n'], every: [.9, 1.5, .6], once: true,
      prop: { svg: '<text font-size="12" text-anchor="middle" dominant-baseline="central">🍊</text>', at: t => (t < .9 ? { x: 35 + 7 * t / .9, y: 3.6 + 15 * Math.sin(t / .9 * Math.PI / 2) } : t < 2.4 ? { x: 42, y: 18.6, s: 1 - Math.floor((t - .9) / .5) * .34 } : null) },
    } },
    // a little bird hops along its back
    play: { dur: 3, def: { shut: true, prop: { svg: '<text font-size="8" text-anchor="middle" dominant-baseline="central">🐤</text>', at: t => ({ x: 12 + 18 * (t / 3), y: 7 - 4 * Math.abs(Math.sin(t * 6)) }) } } },
    // "ok I pull up", and down the pill goes
    medicine: { dur: 2.2, say: 'pullup', def: { frames: ['o', 'o', 'c'], every: [.5, .3, 1.4], once: true, prop: { svg: '<text font-size="8" text-anchor="middle" dominant-baseline="central">💊</text>', at: t => (t > .8 ? null : { x: 42.2 + 8 - t * 7, y: 18.4 - 6 + t * 7 }) } } },
  },
  svg: `
    <g class="legs" fill="#6b4a2f">
      <rect class="la" x="11" y="25" width="4.5" height="8" rx="2"/><rect class="lb" x="16" y="25" width="4.5" height="8" rx="2"/>
      <rect class="lb" x="27" y="25" width="4.5" height="8" rx="2"/><rect class="la" x="31.5" y="25" width="4.5" height="8" rx="2"/>
    </g>
    <g class="body-g">
      <ellipse cx="22" cy="19.5" rx="15" ry="8.5" fill="#a0703f"/>
      <ellipse cx="21" cy="15" rx="10" ry="3" fill="#b07d4a" opacity=".7"/>
      <ellipse cx="31.2" cy="7.6" rx="2" ry="1.6" fill="#8a5d33"/>
      <ellipse cx="36" cy="13" rx="8" ry="7" fill="#a0703f"/>
      <ellipse cx="41.5" cy="15" rx="4.6" ry="4" fill="#8a5d33"/>
      <ellipse cx="44.4" cy="13.4" rx=".7" ry=".5" fill="#3b2618"/>
      <ellipse class="eye" cx="35" cy="11.6" rx="1.4" ry="1.8" fill="#1c1917"/><circle class="eye" cx="35.5" cy="10.8" r=".55" fill="#ffffff"/>
      <path class="eye" d="M33.5 11.4 a1.5 1.5 0 0 1 3 0z" fill="#8a5d33"/>
      <path class="closed" d="M33.4 12.0 q1.6 1.3 3.2 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <path d="M40.6 17.6 q1.5 1 3 0" stroke="#3b2618" stroke-width=".8" fill="none" stroke-linecap="round"/>
      <circle cx="36.4" cy="15.6" r="1.3" fill="#fb7185" opacity=".5"/>
      <circle cx="35" cy="3.6" r="3" fill="#fb923c" data-hide="bath sleep care-pet care-feed:x"/>
      <path d="M35 .7 q2 -1.6 3.6 -.4 q-1.6 1.4 -3.6 .4z" fill="#4ade80" data-hide="bath sleep care-pet care-feed:x"/>
      <circle data-pose="bath:a sleep" cx="50" cy="19.4" r="2.6" fill="#fb923c"/><circle data-pose="bath:b" cx="50" cy="18.4" r="2.6" fill="#fb923c"/>
      <circle data-pose="bath:a" cx="30" cy="9" r=".9" fill="#e0f2fe" opacity=".7"/><circle data-pose="bath:b" cx="31" cy="5.6" r="1.2" fill="#e0f2fe" opacity=".6"/>
      <path data-pose="bath sleep" d="M2 21.5 q4.5 -2 9 0 q4.5 2 9 0 q4.5 -2 9 0 q4.5 2 9 0 q4.5 -2 9 0 q4.5 2 9 0 V28 H2z" fill="#38bdf8" opacity=".78"/>
      <g data-pose="care-pet:a"><circle cx="35" cy="1.6" r="3" fill="#fb923c"/><path d="M35 -1.3 q2 -1.6 3.6 -.4 q-1.6 1.4 -3.6 .4z" fill="#4ade80"/></g>
      <g data-pose="care-pet:b"><circle cx="35" cy="3.6" r="3" fill="#fb923c"/><path d="M35 .7 q2 -1.6 3.6 -.4 q-1.6 1.4 -3.6 .4z" fill="#4ade80"/></g>
    </g>`,
};
