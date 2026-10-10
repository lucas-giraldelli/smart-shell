// Hops about; stands still and turns its head around.
export default {
  color: '#a16207',
  speed: .8,
  hop: true,
  mouth: [23, 19.8],   // where it opens its mouth to yawn
  food: '🐭',            // what it eats (Tamagotchi mode)
  acts: [{ name: 'turn', w: 3, dur: [1.5, 3], turn: true }, { name: 'nap', w: 1, dur: [6, 12], pose: 'sleep' }, { name: 'wink', w: 1, dur: [1, 1.6], pose: 'wink' }, { name: 'spin', w: 1, dur: [2.2, 2.6], pose: 'spin' }, { name: 'talk', w: .6, dur: [1.4, 2], say: 'hoot' }],
  poses: {
    // winks one eye
    wink: {},
    // turns its head all the way round
    spin: { frames: ['l', 'back', 'r', 'f'], every: [.5, .7, .5, .7], once: true },
    // asleep with one eye open
    sleep: {},
  },
  // what it does for each care action (Tamagotchi mode, poses.js carePose)
  care: {
    // eyes squeezed into happy ^^, feathers fluffed
    pet: { dur: 2, def: { frames: ['a', 'b'], every: .3 } },
    // swallows a mouse whole, head tipped back
    feed: { dur: 2.2, def: { move: t => ({ rot: -8 * Math.min(1, t / .4) }), prop: { svg: '<text font-size="8" text-anchor="middle" dominant-baseline="central">🐭</text>', at: t => (t > 1.6 ? null : { x: 23, y: 22 - t * 2, s: 1 - t / 1.9 }) } } },
    // turns its head after a moth
    play: { pose: 'spin', dur: 2.6, def: { prop: { svg: '<text font-size="7" text-anchor="middle" dominant-baseline="central">🦋</text>', at: t => ({ x: 23 + 18 * Math.cos(t * 2.4), y: 6 + 4 * Math.sin(t * 4.8) }) } } },
    // a feather bath: fluffs up and shakes
    clean: { dur: 2.4, def: { frames: ['a', 'b'], every: .2, shut: true, move: t => (t < 1.6 ? {} : { dx: 1.4 * Math.sin(t * 60) }) } },
    // winks, then down the pill goes
    medicine: { pose: 'wink', dur: 2, def: { prop: { svg: '<text font-size="8" text-anchor="middle" dominant-baseline="central">💊</text>', at: t => (t > .9 ? null : { x: 31 - t * 8, y: 12 + t * 7 }) } } },
  },
  svg: `
    <g class="legs" fill="#f59e0b">
      <rect class="la" x="18" y="29" width="3" height="4" rx="1.2"/><rect class="lb" x="25" y="29" width="3" height="4" rx="1.2"/>
    </g>
    <g class="body-g">
      <path class="tail" d="M15 26 l-3 3 l5 -.5z" fill="#78350f"/>
      <ellipse cx="23" cy="20" rx="11" ry="10.5" fill="#a16207"/>
      <ellipse cx="23" cy="23" rx="7" ry="6.5" fill="#fde68a"/>
      <path d="M20 21 l1.2 1.2 l1.2 -1.2 M23.5 23.5 l1.2 1.2 l1.2 -1.2 M20 25.5 l1.2 1.2 l1.2 -1.2" stroke="#ca8a04" stroke-width=".8" fill="none"/>
      <polygon points="14,7 16,12 19,9.5" fill="#78350f"/><polygon points="32,7 30,12 27,9.5" fill="#78350f"/>
      <circle cx="19" cy="14" r="4.2" fill="#fef3c7"/><circle cx="27" cy="14" r="4.2" fill="#fef3c7"/>
      <circle class="eye" cx="19.6" cy="14" r="2.2" fill="#1c1917" data-hide="spin care-pet"/><circle class="eye" cx="27.6" cy="14" r="2.2" fill="#1c1917" data-hide="wink spin care-pet"/>
      <circle class="eye" cx="20.3" cy="13.2" r=".7" fill="#ffffff" data-hide="spin care-pet"/><circle class="eye" cx="28.3" cy="13.2" r=".7" fill="#ffffff" data-hide="wink spin care-pet"/>
      <path class="closed" d="M17 14.3 q2.4 1.6 4.8 0 M25 14.3 q2.4 1.6 4.8 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <polygon points="22,16.5 24,16.5 23,19" fill="#f59e0b" data-hide="spin care-pet"/>
      <circle cx="16.4" cy="18.4" r="1.2" fill="#fb7185" opacity=".5"/><circle cx="29.6" cy="18.4" r="1.2" fill="#fb7185" opacity=".5"/>
      <path data-pose="wink" d="M25 14.3 q2.4 1.6 4.8 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <circle data-pose="spin:l" cx="18.2" cy="14" r="2.2" fill="#1c1917"/><circle data-pose="spin:l" cx="26.2" cy="14" r="2.2" fill="#1c1917"/>
      <circle data-pose="spin:r" cx="20.4" cy="14" r="2.2" fill="#1c1917"/><circle data-pose="spin:r" cx="28.4" cy="14" r="2.2" fill="#1c1917"/>
      <circle data-pose="spin:f" cx="19.6" cy="14" r="2.2" fill="#1c1917"/><circle data-pose="spin:f" cx="27.6" cy="14" r="2.2" fill="#1c1917"/><polygon data-pose="spin:f spin:l spin:r" points="22,16.5 24,16.5 23,19" fill="#f59e0b"/>
      <ellipse data-pose="spin:back" cx="23" cy="14.5" rx="10.6" ry="8" fill="#a16207"/>
      <path data-pose="spin:back" d="M17 12 l1.4 1.4 l1.4 -1.4 M22 10 l1.4 1.4 l1.4 -1.4 M26 13 l1.4 1.4 l1.4 -1.4 M19 16.5 l1.4 1.4 l1.4 -1.4 M24.5 17 l1.4 1.4 l1.4 -1.4" stroke="#78350f" stroke-width=".8" fill="none"/>
      <path data-pose="care-pet" d="M17 15 q2.4 -2.4 4.8 0 M25 15 q2.4 -2.4 4.8 0" stroke="#1c1917" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <path data-pose="care-pet:b care-clean:a" d="M12 18 l-2 -1 M12 22 l-2.4 0 M34 18 l2 -1 M34 22 l2.4 0 M18 9 l-1 -2 M28 9 l1 -2" stroke="#a16207" stroke-width="1.4" stroke-linecap="round"/>
      <path data-pose="care-clean:b" d="M11.5 16 l-2.4 -1.6 M11 21 l-2.8 .4 M34.5 16 l2.4 -1.6 M35 21 l2.8 .4" stroke="#a16207" stroke-width="1.4" stroke-linecap="round"/>
      <g data-pose="sleep"><circle cx="19" cy="14" r="4.2" fill="#fef3c7"/><circle cx="19.6" cy="14" r="2.2" fill="#1c1917"/><circle cx="20.3" cy="13.2" r=".7" fill="#fff"/></g>
    </g>`,
};
