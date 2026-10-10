// Round and pink; lies down in the sun now and then, and sniffs around.
export default {
  color: '#f9a8c0',
  speed: .8,
  mouth: [42.8, 21.2],   // where it opens its mouth to yawn
  food: '🍎',            // what it eats (Tamagotchi mode)
  pace: { clean: 1.5 },   // how fast its needs run down against the default 1
  bath: -1,              // a bath: 1 loves it, -1 sulks (default 0, doesn't mind)
  acts: [{ name: 'lie', w: 1.6, dur: [4, 9], pose: 'lie' }, { name: 'sniff', w: 1.4, dur: [1.5, 3], speed: 10 }, { name: 'mud', w: 1.4, dur: [4, 7], pose: 'mud' }, { name: 'talk', w: .7, dur: [1.2, 1.8], say: 'oink' }, { name: 'happy', w: 1, dur: [1.6, 2.6], pose: 'happy' }],
  poses: {
    // rolls in the mud: a puddle, muddy spots, rocking happily
    mud: { frames: ['a', 'b'], every: [.8, 9], once: true, low: true, shut: true, move: t => ({ rot: 6 * Math.sin(t * 5) }) },
    // so happy: tail spinning, little hops
    happy: { tailFast: true, shut: true, move: t => ({ dy: -2.5 * Math.abs(Math.sin(t * 9)) }) },
    // asleep in the mud
    sleep: {},
  },
  // what it does for each care action (Tamagotchi mode, poses.js carePose)
  care: {
    // so happy: tail spinning, little hops
    pet: { pose: 'happy', dur: 2 },
    // munches an apple, "oink oink"
    feed: { dur: 2.4, say: 'oink', def: { frames: ['o', 'c'], every: .2, prop: { svg: '<text font-size="9" text-anchor="middle" dominant-baseline="central">🍎</text>', at: t => { const s = 1 - Math.floor(t / 0.7) * .34; return s > .05 ? { x: 46.6, y: 21.6, s } : null; } } } },
    // rolls in the mud
    play: { pose: 'mud', dur: 3.2 },
    // a mud bath: to a pig, that's clean
    clean: { pose: 'mud', dur: 3, say: 'oink' },
    // "oink", and down the pill goes
    medicine: { dur: 2, say: 'oink', def: { frames: ['o', 'o', 'c'], every: [.5, .3, 1.2], once: true, prop: { svg: '<text font-size="8" text-anchor="middle" dominant-baseline="central">💊</text>', at: t => (t > .8 ? null : { x: 42.8 + 8 - t * 7, y: 21.2 - 6 + t * 7 }) } } },
  },
  svg: `
    <g class="legs" fill="#e88aa8">
      <rect class="la" x="12" y="25" width="4.5" height="8" rx="2"/><rect class="lb" x="17" y="25" width="4.5" height="8" rx="2"/>
      <rect class="lb" x="28" y="25" width="4.5" height="8" rx="2"/><rect class="la" x="33" y="25" width="4.5" height="8" rx="2"/>
    </g>
    <g class="body-g">
      <path class="tail" d="M9 18 c-3 -1 -4 2 -2 3 c2 1 3 -2 0 -3.5" stroke="#e88aa8" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <ellipse cx="23" cy="19" rx="14.5" ry="9.5" fill="#f9a8c0"/>
      <ellipse cx="33" cy="22" rx="6" ry="2.2" fill="#f48fb1" opacity=".5"/>
      <circle cx="37" cy="15" r="8" fill="#f9a8c0"/>
      <path d="M31.5 9.5 L35 4 L37.5 8.5z" fill="#f48fb1"/><path d="M38.5 7.5 L44 3.5 L43.5 10z" fill="#f48fb1"/>
      <ellipse cx="44" cy="17" rx="3.4" ry="2.8" fill="#f48fb1"/>
      <ellipse cx="43.1" cy="17" rx=".6" ry=".9" fill="#9d4b67"/><ellipse cx="45.1" cy="17" rx=".6" ry=".9" fill="#9d4b67"/>
      <ellipse class="eye" cx="35.8" cy="13.2" rx="1.4" ry="1.8" fill="#1c1917"/><ellipse class="eye" cx="40.4" cy="13" rx="1.4" ry="1.8" fill="#1c1917"/><circle class="eye" cx="36.3" cy="12.4" r=".55" fill="#ffffff"/><circle class="eye" cx="40.9" cy="12.2" r=".55" fill="#ffffff"/>
      <path class="closed" d="M34.2 13.6 q1.6 1.3 3.2 0 M38.8 13.4 q1.6 1.3 3.2 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <path d="M41.2 20.6 q1.6 1.1 3.2 0" stroke="#9d4b67" stroke-width=".8" fill="none" stroke-linecap="round"/>
      <circle cx="33.8" cy="17.4" r="1.4" fill="#f472b6" opacity=".7"/>
      <g data-pose="mud:b" fill="#78350f" opacity=".75"><ellipse cx="17" cy="16" rx="3" ry="2"/><ellipse cx="26" cy="22" rx="3.6" ry="2.2"/><ellipse cx="13" cy="23" rx="2" ry="1.4"/><circle cx="40" cy="20.6" r="1.4"/></g>
      <path data-pose="mud sleep" d="M4 24 q8 -3.5 18 -1.5 q10 -2.5 22 0.5 q4 2 0 4.5 q-20 2 -38 0 q-4 -2 -2 -3.5z" fill="#92400e"/>
    </g>`,
};
