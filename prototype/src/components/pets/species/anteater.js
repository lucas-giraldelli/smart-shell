// Tamanduá-bandeira: ambles with its nose down, a big bushy tail.
export default {
  color: '#78716c',
  speed: .7,
  mouth: [46.2, 22.2],   // where it opens its mouth to yawn
  acts: [{ name: 'stroll', w: 5, dur: [4, 8], speed: 22 }, { name: 'ants', w: 1.4, dur: [2.4, 3.6], pose: 'ants' }, { name: 'hug', w: .8, dur: [1.8, 2.6], say: 'hug', pose: 'hug' }],
  poses: {
    // snout down, its long tongue flicking at ants
    ants: { frames: ['a', 'b'], every: .22, move: () => ({ rot: 6 }) },
    // stands up on its hind legs, arms wide
    hug: { move: () => ({ rot: -16, dx: 3 }) },
    // asleep under its own big tail
    sleep: {},
  },
  // what it does for each care action (Tamagotchi mode, poses.js carePose)
  care: {
    // stands up for a hug
    pet: { pose: 'hug', dur: 2.2 },
    // its long tongue in an anthill
    feed: { pose: 'ants', dur: 3 },
    // digs in the dirt
    play: { dur: 2.6, def: { frames: ['a', 'b'], every: .15, move: t => ({ rot: 8, dx: .8 * Math.sin(t * 30) }) } },
    // licks its fur clean
    clean: { dur: 2.4, def: { frames: ['a', 'b'], every: .25, shut: true, move: () => ({ rot: -4 }) } },
    // the tongue snaps up the pill
    medicine: { pose: 'ants', dur: 2.2, def: { prop: { svg: '<text font-size="8" text-anchor="middle" dominant-baseline="central">💊</text>', at: t => (t > 1.1 ? null : { x: 52.5, y: 32 }) } } },
  },
  svg: `
    <g class="legs" fill="#57534e">
      <rect class="la" x="13" y="24" width="4" height="9" rx="2"/><rect class="lb" x="18" y="24" width="4" height="9" rx="2"/>
      <rect class="lb" x="27" y="24" width="4" height="9" rx="2"/><rect class="la" x="32" y="24" width="4" height="9" rx="2"/>
    </g>
    <g class="body-g">
      <path class="tail" d="M11 21 C2 22 -1 12 4 7 C9 9 12 15 13 19z" fill="#6b645e" data-hide="sleep"/>
      <ellipse cx="23" cy="20.5" rx="13" ry="7.5" fill="#bdb6af"/>
      <path d="M33 14.5 q-7 5 -16 8.5 l2.5 1.8 q8 -3 15 -7.5z" fill="#1c1917"/>
      <path d="M32.6 14 q-7 5 -16 8.4" stroke="#f5f5f4" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <ellipse cx="35.5" cy="16" rx="5" ry="4.5" fill="#bdb6af"/>
      <path d="M38 13.6 Q47 16.5 46.5 21.5 Q44.5 22.5 37 19.5z" fill="#bdb6af"/>
      <circle cx="34" cy="12.2" r="1.7" fill="#8a837c"/>
      <ellipse class="eye" cx="37.4" cy="15.2" rx="1.3" ry="1.7" fill="#1c1917"/><circle class="eye" cx="37.9" cy="14.4" r=".55" fill="#ffffff"/>
      <path class="closed" d="M35.9 15.6 q1.5 1.3 3.0 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <circle cx="36.4" cy="18.8" r="1.2" fill="#fb7185" opacity=".5"/>
      <circle cx="45.8" cy="21.4" r=".9" fill="#1c1917"/>
      <path data-pose="ants:a" d="M46 21.6 Q50 25 52.5 32.4" stroke="#f472b6" stroke-width="1" fill="none" stroke-linecap="round"/>
      <path data-pose="ants:b" d="M46 21.6 Q48 24 48.6 26.6" stroke="#f472b6" stroke-width="1" fill="none" stroke-linecap="round"/>
      <g data-pose="ants" fill="#1c1917"><circle cx="50.5" cy="33" r=".7"/><circle cx="51.6" cy="33" r=".5"/><circle cx="54" cy="33.2" r=".7"/><circle cx="55.1" cy="33.2" r=".5"/></g>
      <path data-pose="hug" d="M32 22 L38 15 M30.5 22.5 L37.5 19" stroke="#57534e" stroke-width="3.2" stroke-linecap="round"/>
      <g data-pose="care-play:a" fill="#a16207"><circle cx="50" cy="31" r="1.4"/><circle cx="54" cy="27" r="1"/><circle cx="47" cy="27" r=".8"/></g>
      <g data-pose="care-play:b" fill="#a16207"><circle cx="52" cy="29" r="1.2"/><circle cx="49" cy="24" r="1"/><circle cx="55" cy="31" r=".8"/></g>
      <path data-pose="care-clean:a" d="M37 18 Q30 16 24 15" stroke="#f472b6" stroke-width="1" fill="none" stroke-linecap="round"/>
      <path data-pose="care-clean:b" d="M37 18 Q31 18 26 19" stroke="#f472b6" stroke-width="1" fill="none" stroke-linecap="round"/>
      <path data-pose="sleep" d="M9 22 C-2 18 4 6 14 9 C26 12 34 12 37 18 C30 26 18 27 9 22z" fill="#6b645e"/>
    </g>`,
};
