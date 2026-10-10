// Floats instead of walking; drifts slowly and fades a little. Never sleeps:
// at low load it keeps haunting.
export default {
  color: '#f8fafc',
  speed: .7,
  float: true,
  sleepless: true,
  food: '🍬',            // what it eats (Tamagotchi mode)
  pace: { clean: 0 },   // how fast its needs run down against the default 1
  acts: [{ name: 'stand', w: 3, dur: [2, 5] }, { name: 'turn', w: 1, dur: [1, 2], turn: true }, { name: 'fade', w: 1, dur: [2.4, 3.6], pose: 'fade' }, { name: 'talk', w: .8, dur: [1.2, 1.8], say: 'boo', pose: 'shout' }, { name: 'flip', w: .7, dur: [1.6, 2.6], pose: 'flip' }],
  poses: {
    // fades nearly out and back
    fade: { move: t => ({ opacity: .15 + .85 * Math.abs(Math.cos(t * 1.4)) }) },
    // its boo: the mouth opens wide and closes
    shout: { frames: ['o', 'm'], every: .18 },
    // floats upside down for a bit
    flip: { move: t => ({ rot: 180 + 6 * Math.sin(t * 3), dy: -36 }) },
  },
  // what it does for each care action (Tamagotchi mode, poses.js carePose)
  care: {
    // blushes pink, pulsing
    pet: { dur: 2, def: { frames: ['a', 'b'], every: .35 } },
    // the candy goes right through it
    feed: { dur: 2.2, def: {
      frames: ['o', 'm'], every: .2,
      prop: { svg: '<text font-size="8" text-anchor="middle" dominant-baseline="central">🍬</text>', at: t => ({ x: 50 - t * 26, y: 19 }) },
    } },
    // hide and seek: vanishes, comes back on the other side
    play: { dur: 3, def: {
      move: t => (t < .6 ? { opacity: 1 - t / .6 } : t < 1.4 ? { opacity: 0, dx: -12 } : t < 2 ? { opacity: (t - 1.4) / .6, dx: -12, flip: true } : { dx: -12 * (1 - (t - 2)), flip: true }),
    } },
    // sparkling clean
    clean: { dur: 2.2, def: { frames: ['a', 'b'], every: .25 } },
    // boo! the pill bounces off
    medicine: { dur: 1.8, say: 'boo', def: {
      frames: ['o', 'm'], every: .18,
      prop: { svg: '<text font-size="8" text-anchor="middle" dominant-baseline="central">💊</text>', at: t => ({ x: 40 + t * 12, y: 18 - 10 * Math.abs(Math.sin(t * 5)) }) },
    } },
  },
  svg: `
    <g class="body-g" opacity=".92">
      <path d="M11 30 V16 q0 -12 12 -12 q12 0 12 12 V30 l-3 -2.5 l-3 2.5 l-3 -2.5 l-3 2.5 l-3 -2.5 l-3 2.5 l-3 -2.5z" fill="#f8fafc"/>
      <path data-pose="care-pet:a" d="M11 30 V16 q0 -12 12 -12 q12 0 12 12 V30 l-3 -2.5 l-3 2.5 l-3 -2.5 l-3 2.5 l-3 -2.5 l-3 2.5 l-3 -2.5z" fill="#f9a8d4" opacity=".55"/>
      <path data-pose="care-pet:b" d="M11 30 V16 q0 -12 12 -12 q12 0 12 12 V30 l-3 -2.5 l-3 2.5 l-3 -2.5 l-3 2.5 l-3 -2.5 l-3 2.5 l-3 -2.5z" fill="#f9a8d4" opacity=".3"/>
      <path d="M31 9 q2.5 3 2.5 8" stroke="#e2e8f0" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <ellipse class="eye" cx="20" cy="15" rx="1.6" ry="2.2" fill="#1e293b"/><ellipse class="eye" cx="27" cy="15" rx="1.6" ry="2.2" fill="#1e293b"/>
      <path class="closed" d="M18.3 15.4 q1.7 1.4 3.4 0 M25.3 15.4 q1.7 1.4 3.4 0" stroke="#1e293b" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <ellipse cx="23.5" cy="20.5" rx="1.6" ry="2" fill="#1e293b" data-hide="shout care-feed care-medicine"/>
      <ellipse data-pose="shout:o care-feed:o care-medicine:o" cx="23.5" cy="21" rx="2.3" ry="3" fill="#1e293b"/>
      <ellipse data-pose="shout:m care-feed:m care-medicine:m" cx="23.5" cy="20.6" rx="1.7" ry="2" fill="#1e293b"/>
      <circle cx="17" cy="18.6" r="1.4" fill="#fbcfe8" opacity=".7"/><circle cx="30" cy="18.6" r="1.4" fill="#fbcfe8" opacity=".7"/>
      <g data-pose="care-clean:a" fill="#fde047"><path d="M8 8 l.8 2 l2 .8 l-2 .8 l-.8 2 l-.8 -2 l-2 -.8 l2 -.8z"/><path d="M38 14 l.6 1.5 l1.5 .6 l-1.5 .6 l-.6 1.5 l-.6 -1.5 l-1.5 -.6 l1.5 -.6z"/></g>
      <g data-pose="care-clean:b" fill="#fde047"><path d="M36 4 l.8 2 l2 .8 l-2 .8 l-.8 2 l-.8 -2 l-2 -.8 l2 -.8z"/><path d="M7 20 l.6 1.5 l1.5 .6 l-1.5 .6 l-.6 1.5 l-.6 -1.5 l-1.5 -.6 l1.5 -.6z"/></g>
    </g>`,
};
