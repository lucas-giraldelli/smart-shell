// Slow and waddles; mostly stands around.
export default {
  color: '#1f2937',
  speed: .7,
  waddle: true,
  mouth: [34.4, 14.4],   // where it opens its mouth to yawn
  food: '🐟',            // what it eats (Tamagotchi mode)
  bath: 1,              // a bath: 1 loves it, -1 sulks (default 0, doesn't mind)
  acts: [{ name: 'stand', w: 5, dur: [3, 6] }, { name: 'slide', w: 1.2, dur: [1.6, 2.6], pose: 'slide', speed: 60 }, { name: 'talk', w: .7, dur: [1.4, 2], say: 'noot' }, { name: 'flap', w: 1, dur: [1.2, 2], pose: 'flap' }],
  poses: {
    // slides on its belly
    slide: { move: () => ({ rot: 80, dy: -8 }) },
    // flaps its little flippers
    flap: { frames: ['a', 'b'], every: .14, move: t => ({ dy: -1 * Math.abs(Math.sin(t * 22)) }) },
    // asleep standing up, beak down
    sleep: { move: () => ({ rot: 7 }) },
  },
  // what it does for each care action (Tamagotchi mode, poses.js carePose)
  care: {
    // "noot noot", flapping with joy
    pet: { pose: 'flap', dur: 1.8, say: 'noot' },
    // tips its head back and swallows the fish whole
    feed: { dur: 2.2, def: { move: t => ({ rot: -10 * Math.min(1, t / .4) }), prop: { svg: '<text font-size="8" text-anchor="middle" dominant-baseline="central">🐟</text>', at: t => (t > 1.5 ? null : { x: 36 - t * 2, y: 10 + t * 3, s: 1 - t / 1.8 }) } } },
    // slides on its belly after a ball
    play: { pose: 'slide', dur: 2.4, def: { speed: 50, prop: { svg: '<text font-size="8" text-anchor="middle" dominant-baseline="central">🎾</text>', at: t => ({ x: 54, y: 31 - 6 * Math.abs(Math.sin(t * 6)) }) } } },
    // swallows the pill, then slides off
    medicine: { dur: 2.2, def: { frames: ['o', 'o', 'c'], every: [.5, .3, 1.4], once: true, prop: { svg: '<text font-size="8" text-anchor="middle" dominant-baseline="central">💊</text>', at: t => (t > .8 ? null : { x: 34.4 + 8 - t * 7, y: 14.4 - 6 + t * 7 }) }, move: t => (t > 1 ? { rot: 80 * Math.min(1, (t - 1) / .3), dy: -8 * Math.min(1, (t - 1) / .3) } : {}) } },
  },
  svg: `
    <g class="legs" fill="#f59e0b">
      <rect class="la" x="18" y="30" width="6" height="4" rx="2" data-hide="slide"/><rect class="lb" x="25" y="30" width="6" height="4" rx="2" data-hide="slide"/>
    </g>
    <g class="body-g">
      <ellipse cx="24" cy="19" rx="10" ry="13" fill="#1f2937"/>
      <path data-pose="flap:a" d="M16 17 q-7 -2 -9 -7" stroke="#111827" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path data-pose="flap:b" d="M16 17 q-6 4 -8 9" stroke="#111827" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path class="tail" data-hide="flap" style="transform-origin: 50% 0%" d="M16 16 q-5 6 -2 11" stroke="#111827" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="26" cy="22" rx="7" ry="9.5" fill="#f8fafc"/>
      <ellipse cx="26" cy="27" rx="5.5" ry="4" fill="#e2e8f0"/>
      <ellipse cx="28" cy="12" rx="6.5" ry="4.8" fill="#f8fafc"/>
      <ellipse class="eye" cx="25.8" cy="11.6" rx="1.4" ry="1.9" fill="#111827"/><ellipse class="eye" cx="30.6" cy="11.6" rx="1.4" ry="1.9" fill="#111827"/><circle class="eye" cx="26.3" cy="10.8" r=".55" fill="#ffffff"/><circle class="eye" cx="31.1" cy="10.8" r=".55" fill="#ffffff"/>
      <path class="closed" d="M24.2 12.0 q1.6 1.3 3.2 0 M29.0 12.0 q1.6 1.3 3.2 0" stroke="#111827" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <polygon points="33,12.5 38.5,13.6 33,15" fill="#f59e0b"/>
      <circle cx="24.6" cy="14.8" r="1.1" fill="#f9a8d4" opacity=".75"/><circle cx="31.6" cy="15" r="1.1" fill="#f9a8d4" opacity=".75"/>
    </g>`,
};
