// Waddles along; stops to preen.
export default {
  color: '#facc15',
  speed: .8,
  waddle: true,
  mouth: [41.2, 14.4],   // where it opens its mouth to yawn
  food: '🍞',            // what it eats (Tamagotchi mode)
  bath: 1,              // a bath: 1 loves it, -1 sulks (default 0, doesn't mind)
  acts: [{ name: 'stand', w: 4, dur: [2, 5] }, { name: 'flap', w: 1.2, dur: [1.2, 2], pose: 'flap' }, { name: 'talk', w: .8, dur: [1.2, 1.8], say: 'quack' }, { name: 'ducklings', w: 1, dur: [3, 5], pose: 'ducklings', speed: 14 }],
  poses: {
    // flaps its wings
    flap: { frames: ['a', 'b'], every: .16, move: t => ({ dy: -1.5 * Math.abs(Math.sin(t * 19.6)) }) },
    // its ducklings waddle along behind it
    ducklings: { frames: ['a', 'b'], every: .25 },
    // asleep with its head tucked under its wing
    sleep: {},
  },
  // what it does for each care action (Tamagotchi mode, poses.js carePose)
  care: {
    // a happy quack, tail wagging
    pet: { dur: 1.8, say: 'quack', def: { shut: true, tailFast: true, move: t => ({ rot: 3 * Math.sin(t * 8) }) } },
    // pecks at bread crumbs on the floor
    feed: { dur: 2.6, def: { move: t => ({ rot: 22 * Math.abs(Math.sin(t * 6)) }), prop: { svg: '<text font-size="12" text-anchor="middle" dominant-baseline="central">🍞</text>', at: t => { const s = 1 - Math.floor(t / .8) * .3; return s > .05 ? { x: 47, y: 31.5, s } : null; } } } },
    // paddles around a little pond
    play: { dur: 3, def: { frames: ['a', 'b'], every: .4, low: true, move: t => ({ dy: Math.sin(t * 4), dx: 3 * Math.sin(t * 1.2), flip: Math.cos(t * 1.2) < 0 }) } },
    // pecks the pill up like bread
    medicine: { dur: 2, def: { move: t => (t < 1 ? { rot: 22 * Math.abs(Math.sin(t * 6)) } : { dy: -2 * Math.abs(Math.sin(t * 8)) }), prop: { svg: '<text font-size="8" text-anchor="middle" dominant-baseline="central">💊</text>', at: t => (t > 1 ? null : { x: 47, y: 32 }) } } },
  },
  svg: `
    <g class="legs" fill="#f97316">
      <rect class="la" x="19" y="26" width="2.6" height="7" rx="1.2"/><rect class="lb" x="25" y="26" width="2.6" height="7" rx="1.2"/>
    </g>
    <g class="body-g">
      <ellipse data-pose="care-play" cx="22" cy="27" rx="21" ry="3.6" fill="#38bdf8" opacity=".75"/>
      <path data-pose="care-play:a" d="M3 25 q2 -1 4 0 M40 26 q2 -1 4 0" stroke="#e0f2fe" stroke-width=".8" fill="none"/>
      <path data-pose="care-play:b" d="M6 26 q2 -1 4 0 M37 25 q2 -1 4 0" stroke="#e0f2fe" stroke-width=".8" fill="none"/>
      <ellipse data-pose="care-clean" cx="22" cy="31.5" rx="16" ry="2.2" fill="#38bdf8" opacity=".6"/>
      <path class="tail" d="M12 20 L6 15 L9 21z" fill="#eab308"/>
      <ellipse cx="22" cy="22" rx="12" ry="7.5" fill="#facc15"/>
      <path d="M14 20 q7 7 14 0" stroke="#eab308" stroke-width="1.6" fill="none" stroke-linecap="round" data-hide="flap care-clean"/>
      <circle cx="33" cy="12" r="7" fill="#facc15" data-hide="sleep"/>
      <path d="M38.5 12.5 q6 -.5 6.5 1.5 q-.5 2 -6.5 1.6z" fill="#f97316" data-hide="sleep"/>
      <path data-hide="sleep" d="M38.8 14.1 q3 .5 6 -.2" stroke="#c2410c" stroke-width=".6" fill="none" stroke-linecap="round"/>
      <ellipse class="eye" cx="35" cy="10.5" rx="1.5" ry="2" fill="#1c1917" data-hide="sleep"/><circle class="eye" cx="35.5" cy="9.7" r=".55" fill="#ffffff" data-hide="sleep"/>
      <path class="closed" d="M33.3 10.9 q1.7 1.3 3.4 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round" data-hide="sleep"/>
      <circle cx="32" cy="14.4" r="1.3" fill="#fb923c" opacity=".55" data-hide="sleep"/>
      <path data-pose="flap:a care-clean:a" d="M15 20 q2 -11 12 -6 q-5 3 -12 6z" fill="#eab308"/>
      <path data-pose="flap:b care-clean:b" d="M15 21 q6 8 12 0z" fill="#eab308"/>
      <g data-pose="ducklings:a" fill="#fde047"><ellipse cx="9" cy="30.4" rx="3" ry="2.2"/><circle cx="11" cy="27.6" r="1.9"/><ellipse cx="2.6" cy="29.8" rx="2.6" ry="2"/><circle cx="4.4" cy="27.2" r="1.7"/></g>
      <g data-pose="ducklings:b" fill="#fde047"><ellipse cx="9" cy="30" rx="3" ry="2.2"/><circle cx="11" cy="27.2" r="1.9"/><ellipse cx="2.6" cy="30.2" rx="2.6" ry="2"/><circle cx="4.4" cy="27.6" r="1.7"/></g>
      <g data-pose="ducklings" fill="#f97316"><path d="M12.6 27.4 l1.6 .3 l-1.6 .5z"/><path d="M5.8 27.2 l1.4 .3 l-1.4 .5z"/></g>
      <g data-pose="ducklings" fill="#1c1917"><circle cx="11.6" cy="27" r=".45"/><circle cx="4.9" cy="26.8" r=".4"/></g>
      <g data-pose="sleep"><circle cx="30" cy="16" r="5.5" fill="#facc15"/><path d="M24 16 q6 -6 12 0 q-6 4 -12 0z" fill="#eab308"/></g>
    </g>`,
};
