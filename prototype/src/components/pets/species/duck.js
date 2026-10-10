// Waddles along; stops to preen.
export default {
  color: '#facc15',
  speed: .8,
  waddle: true,
  mouth: [41.2, 14.4],   // where it opens its mouth to yawn
  acts: [{ name: 'stand', w: 4, dur: [2, 5] }, { name: 'flap', w: 1.2, dur: [1.2, 2], pose: 'flap' }, { name: 'talk', w: .8, dur: [1.2, 1.8], say: 'quack' }, { name: 'ducklings', w: 1, dur: [3, 5], pose: 'ducklings', speed: 14 }],
  poses: {
    // flaps its wings
    flap: { frames: ['a', 'b'], every: .16, move: t => ({ dy: -1.5 * Math.abs(Math.sin(t * 19.6)) }) },
    // its ducklings waddle along behind it
    ducklings: { frames: ['a', 'b'], every: .25 },
  },
  svg: `
    <g class="legs" fill="#f97316">
      <rect class="la" x="19" y="26" width="2.6" height="7" rx="1.2"/><rect class="lb" x="25" y="26" width="2.6" height="7" rx="1.2"/>
    </g>
    <g class="body-g">
      <path class="tail" d="M12 20 L6 15 L9 21z" fill="#eab308"/>
      <ellipse cx="22" cy="22" rx="12" ry="7.5" fill="#facc15"/>
      <path d="M14 20 q7 7 14 0" stroke="#eab308" stroke-width="1.6" fill="none" stroke-linecap="round" data-hide="flap"/>
      <circle cx="33" cy="12" r="7" fill="#facc15"/>
      <path d="M38.5 12.5 q6 -.5 6.5 1.5 q-.5 2 -6.5 1.6z" fill="#f97316"/>
      <path d="M38.8 14.1 q3 .5 6 -.2" stroke="#c2410c" stroke-width=".6" fill="none" stroke-linecap="round"/>
      <ellipse class="eye" cx="35" cy="10.5" rx="1.5" ry="2" fill="#1c1917"/><circle class="eye" cx="35.5" cy="9.7" r=".55" fill="#ffffff"/>
      <path class="closed" d="M33.3 10.9 q1.7 1.3 3.4 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <circle cx="32" cy="14.4" r="1.3" fill="#fb923c" opacity=".55"/>
      <path data-pose="flap:a" d="M15 20 q2 -11 12 -6 q-5 3 -12 6z" fill="#eab308"/>
      <path data-pose="flap:b" d="M15 21 q6 8 12 0z" fill="#eab308"/>
      <g data-pose="ducklings:a" fill="#fde047"><ellipse cx="9" cy="30.4" rx="3" ry="2.2"/><circle cx="11" cy="27.6" r="1.9"/><ellipse cx="2.6" cy="29.8" rx="2.6" ry="2"/><circle cx="4.4" cy="27.2" r="1.7"/></g>
      <g data-pose="ducklings:b" fill="#fde047"><ellipse cx="9" cy="30" rx="3" ry="2.2"/><circle cx="11" cy="27.2" r="1.9"/><ellipse cx="2.6" cy="30.2" rx="2.6" ry="2"/><circle cx="4.4" cy="27.6" r="1.7"/></g>
      <g data-pose="ducklings" fill="#f97316"><path d="M12.6 27.4 l1.6 .3 l-1.6 .5z"/><path d="M5.8 27.2 l1.4 .3 l-1.4 .5z"/></g>
      <g data-pose="ducklings" fill="#1c1917"><circle cx="11.6" cy="27" r=".45"/><circle cx="4.9" cy="26.8" r=".4"/></g>
    </g>`,
};
