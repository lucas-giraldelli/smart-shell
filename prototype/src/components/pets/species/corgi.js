// Short legs, big ears, always in a hurry; bursts of zoomies.
export default {
  color: '#f59e42',
  speed: 1.2,
  acts: [{ name: 'zoomies', w: 1.4, dur: [1.2, 2.2], speed: 150 }, { name: 'chase', w: 1, dur: [1.6, 2.6], pose: 'chase' }, { name: 'talk', w: .8, dur: [1.2, 1.8], say: 'woof' }],
  poses: {
    // chases its own tail: spins and hops
    chase: { move: t => ({ flip: Math.floor(t / .2) % 2 === 1, dy: -3 * Math.abs(Math.sin(t * 15.7)) }) },
  },
  svg: `
    <g class="legs" fill="#e07f24">
      <rect class="la" x="12" y="26" width="4.5" height="7" rx="2"/><rect class="lb" x="17" y="26" width="4.5" height="7" rx="2"/>
      <rect class="lb" x="28" y="26" width="4.5" height="7" rx="2"/><rect class="la" x="33" y="26" width="4.5" height="7" rx="2"/>
    </g>
    <g class="body-g">
      <ellipse class="tail" cx="9" cy="18" rx="3.4" ry="2.6" fill="#f59e42"/>
      <ellipse cx="23" cy="22" rx="14.5" ry="7.5" fill="#f59e42"/>
      <ellipse cx="25" cy="26" rx="10" ry="3.2" fill="#fff7ed"/>
      <polygon points="30,10 31,-1 37,7" fill="#f59e42"/><polygon points="38,7 45,-1 44,11" fill="#f59e42"/>
      <polygon points="31.5,8.5 32,2 35.5,7" fill="#fecaca"/><polygon points="39.5,7 43.5,2 43,9.5" fill="#fecaca"/>
      <circle cx="37" cy="14" r="8" fill="#f59e42"/>
      <path d="M37.3 6.4 q-.5 3.4 .2 6.6" stroke="#fff7ed" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="41" cy="17.2" rx="4.6" ry="3.2" fill="#fff7ed"/>
      <ellipse class="eye" cx="34.4" cy="12.4" rx="1.5" ry="1.9" fill="#1c1917"/><ellipse class="eye" cx="40.2" cy="12.4" rx="1.5" ry="1.9" fill="#1c1917"/><circle class="eye" cx="34.9" cy="11.6" r=".55" fill="#ffffff"/><circle class="eye" cx="40.7" cy="11.6" r=".55" fill="#ffffff"/>
      <path class="closed" d="M32.7 12.8 q1.7 1.3 3.4 0 M38.5 12.8 q1.7 1.3 3.4 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <ellipse cx="44.6" cy="15.8" rx="1.4" ry="1.1" fill="#1c1917"/>
      <path d="M41.4 18.4 q1.5 1.3 3 0" stroke="#1c1917" stroke-width=".8" fill="none" stroke-linecap="round"/>
      <path d="M42.3 19 q.8 2.4 1.6 0z" fill="#fb7185"/>
      <circle cx="33.4" cy="16.4" r="1.2" fill="#f9a8d4" opacity=".65"/>
    </g>`,
};
