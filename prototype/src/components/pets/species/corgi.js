// Short legs, big ears, always in a hurry; bursts of zoomies.
export default {
  color: '#f59e42',
  speed: 1.2,
  acts: [{ name: 'zoomies', w: 1.4, dur: [1.2, 2.2], speed: 150 }],
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
      <path d="M37 7 q-1.5 7 1 12 h6 q1 -6 -2 -9z" fill="#fff7ed"/>
      <ellipse class="eye" cx="34.6" cy="12.6" rx="1.2" ry="1.6" fill="#1c1917"/><ellipse class="eye" cx="40.4" cy="12.6" rx="1.2" ry="1.6" fill="#1c1917"/>
      <path class="closed" d="M33.2 13 q1.4 1.2 2.8 0 M39 13 q1.4 1.2 2.8 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <ellipse cx="44.6" cy="17" rx="1.4" ry="1.1" fill="#1c1917"/>
      <path d="M41.5 19.5 q1.5 1.5 3 0" stroke="#1c1917" stroke-width=".8" fill="none" stroke-linecap="round"/>
    </g>`,
};
