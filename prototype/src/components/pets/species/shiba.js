// Fast; gets random zoomies and jumps.
export default {
  color: '#e0a15e',
  speed: 1.15,
  acts: [{ name: 'zoomies', w: 1.2, dur: [1.4, 2.4], speed: 150 }, { name: 'jump', w: 1, dur: [.7, 1.2], jump: true }],
  svg: `
    <g class="legs" fill="#c98545">
      <rect class="la" x="12" y="24" width="4.5" height="9" rx="2"/><rect class="lb" x="17" y="24" width="4.5" height="9" rx="2"/>
      <rect class="lb" x="28" y="24" width="4.5" height="9" rx="2"/><rect class="la" x="33" y="24" width="4.5" height="9" rx="2"/>
    </g>
    <g class="body-g">
      <path class="tail" d="M11 17 C4 15 4 6 10 7 C14 8 12 13 9 12" stroke="#e0a15e" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="23" cy="22" rx="14" ry="8" fill="#e0a15e"/>
      <ellipse cx="25" cy="26" rx="9" ry="3.5" fill="#fbf1e3"/>
      <polygon points="31,9 31,1 36,6" fill="#e0a15e"/><polygon points="38,6 43,1 43,10" fill="#e0a15e"/>
      <polygon points="32,8 32,3.5 35,6.5" fill="#fbd5ad"/><polygon points="39.5,6.5 42,3.5 42,8.5" fill="#fbd5ad"/>
      <circle cx="37" cy="13" r="8" fill="#e0a15e"/>
      <ellipse cx="40" cy="16.5" rx="5" ry="3.2" fill="#fbf1e3"/>
      <circle cx="33.6" cy="15.6" r="1.3" fill="#f9a8d4" opacity=".7"/>
      <ellipse class="eye" cx="34.8" cy="11.5" rx="1.2" ry="1.6" fill="#1c1917"/><ellipse class="eye" cx="40" cy="11.5" rx="1.2" ry="1.6" fill="#1c1917"/>
      <path class="closed" d="M33.4 11.9 q1.4 1.2 2.8 0 M38.6 11.9 q1.4 1.2 2.8 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <ellipse cx="44.2" cy="15.4" rx="1.4" ry="1.1" fill="#1c1917"/>
    </g>`,
};
