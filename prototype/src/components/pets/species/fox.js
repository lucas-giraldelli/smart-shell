// The fastest; strolls a lot and pounces.
export default {
  color: '#f97316',
  speed: 1.3,
  mouth: [43.2, 18.2],   // where it opens its mouth to yawn
  food: '🍗',            // what it eats (Tamagotchi mode)
  acts: [{ name: 'stroll', w: 5, dur: [3, 7], speed: 30 }, { name: 'pounce', w: 1.5, dur: [.7, 1.1], jump: true }, { name: 'dive', w: 1, dur: [2.6, 3], pose: 'dive' }, { name: 'talk', w: .6, dur: [1.2, 1.8], say: 'yip' }],
  poses: {
    // a mousing dive: crouch, a high arc, nose buried in the snow
    dive: {
      frames: ['a', 'b', 'c'], every: [.45, .6, 2], once: true,
      move: t => (t < .45 ? { dx: -6, dy: 2, rot: -6 }
        : t < 1.05 ? { dx: -6, dy: -14 * Math.sin((t - .45) / .6 * Math.PI), rot: 35 * (t - .45) / .6 }
        : { dx: -6, rot: 35 }),
    },
    // asleep: curled up in its tail
    sleep: {},
  },
  // what it does for each care action (Tamagotchi mode, poses.js carePose)
  care: {
    // ears flat, rubbing against you
    pet: { dur: 2, def: { shut: true, move: t => ({ rot: 3 * Math.sin(t * 5), dx: Math.sin(t * 5) }) } },
    // pounces on its snack, nose first
    feed: { pose: 'dive', dur: 3, def: { prop: { svg: '<text font-size="8" text-anchor="middle" dominant-baseline="central">🍗</text>', at: t => (t > 2.6 ? null : { x: 50, y: 31.5, s: t < 1.4 ? 1 : 1 - (t - 1.4) / 1.3 }) } } },
    // chases its own tail, round and round
    play: { dur: 2.4, def: { tailFast: true, move: t => ({ flip: Math.floor(t / .22) % 2 === 1, dy: -2 * Math.abs(Math.sin(t * 14)) }) } },
    // licks the white tip of its tail
    clean: { dur: 2.4, def: { frames: ['a', 'b'], every: .28, shut: true } },
    // swallows the pill, then sneezes
    medicine: { dur: 2.4, def: {
      frames: ['o', 'o', 'c', 's', 'c'], every: [.5, .3, .6, .3, .7], once: true,
      prop: { svg: '<text font-size="8" text-anchor="middle" dominant-baseline="central">💊</text>', at: t => (t > .8 ? null : { x: 43.2 + 8 - t * 7, y: 18.2 - 6 + t * 7 }) },
      move: t => (t > 1.4 && t < 1.7 ? { rot: -8, dy: -1 } : {}),
    } },
  },
  svg: `
    <g class="legs" fill="#3b2618">
      <rect class="la" x="13" y="24" width="3.5" height="9" rx="1.7"/><rect class="lb" x="18" y="24" width="3.5" height="9" rx="1.7"/>
      <rect class="lb" x="28" y="24" width="3.5" height="9" rx="1.7"/><rect class="la" x="32.5" y="24" width="3.5" height="9" rx="1.7"/>
    </g>
    <g class="body-g">
      <g class="tail" style="transform-origin: 100% 30%" data-hide="sleep care-clean">
        <ellipse cx="11" cy="18" rx="8.5" ry="4.6" transform="rotate(-20 11 18)" fill="#f97316"/>
        <circle cx="5" cy="20.4" r="3" fill="#fff7ed"/>
      </g>
      <ellipse cx="23" cy="22" rx="13" ry="7.5" fill="#f97316"/>
      <ellipse cx="31" cy="23" rx="4" ry="4.5" fill="#fff7ed"/>
      <polygon points="30,10 30,0 36,6" fill="#f97316" data-hide="care-pet"/><polygon points="38,6 44,0 43.5,10" fill="#f97316" data-hide="care-pet"/>
      <polygon points="30.8,7 30.8,2 33.5,5" fill="#3b2618" data-hide="care-pet"/><polygon points="39.5,6 43,2 42.8,7.5" fill="#3b2618" data-hide="care-pet"/>
      <circle cx="36" cy="13" r="7.5" fill="#f97316"/>
      <polygon points="40,10 46.5,15 40,18.5" fill="#f97316"/>
      <ellipse cx="40" cy="16.4" rx="4.6" ry="2.5" fill="#fff7ed"/>
      <ellipse class="eye" cx="34.4" cy="11.6" rx="1.4" ry="1.9" fill="#1c1917"/><ellipse class="eye" cx="39.4" cy="11.6" rx="1.4" ry="1.9" fill="#1c1917"/><circle class="eye" cx="34.9" cy="10.8" r=".55" fill="#ffffff"/><circle class="eye" cx="39.9" cy="10.8" r=".55" fill="#ffffff"/>
      <path class="closed" d="M32.8 12.0 q1.6 1.3 3.2 0 M37.8 12.0 q1.6 1.3 3.2 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <circle cx="46" cy="15" r="1.1" fill="#1c1917"/>
      <path d="M41.6 17.4 q1.5 1.3 3 0" stroke="#3b2618" stroke-width=".8" fill="none" stroke-linecap="round"/>
      <circle cx="33" cy="15.2" r="1.2" fill="#f9a8d4" opacity=".65"/>
      <ellipse data-pose="sleep" cx="30" cy="24" rx="12" ry="4.2" fill="#f97316"/>
      <ellipse data-pose="sleep" cx="41" cy="23.4" rx="3.4" ry="2.8" fill="#fff7ed"/>
      <g data-pose="dive:c" transform="translate(47.25 16.6) rotate(-35)" fill="#f8fafc"><path d="M-7.5 2 q1.5 -6 7.5 -6 q6 0 7.5 6z"/><circle cx="-6" cy="-6" r=".8"/><circle cx="5" cy="-8" r=".7"/><circle cx="8" cy="-4" r=".6"/></g>
      <g data-pose="care-pet"><polygon points="31,11 24,6 34,8" fill="#f97316"/><polygon points="38,8 45,4 42,11" fill="#f97316"/></g>
      <g data-pose="care-clean"><ellipse cx="33" cy="25" rx="9" ry="4" transform="rotate(-10 33 25)" fill="#f97316"/><circle cx="40.5" cy="21" r="3" fill="#fff7ed"/></g>
      <ellipse data-pose="care-clean:b" cx="42.4" cy="19.2" rx="1" ry=".8" fill="#f472b6"/>
      <g data-pose="care-medicine:s" stroke="#fff" stroke-width=".7" stroke-linecap="round"><path d="M47 13 l3 -2 M47.5 15.5 l3.5 .2 M47 18 l3 2"/></g>
    </g>`,
};
