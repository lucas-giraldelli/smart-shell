// Moves by hopping; sometimes lies down.
export default {
  color: '#e2e8f0',
  speed: 1.1,
  hop: true,
  acts: [{ name: 'jump', w: 1.5, dur: [.7, 1.1], jump: true }, { name: 'lie', w: 1, dur: [4, 8], pose: 'lie' }],
  svg: `
    <g class="legs" fill="#d4d9e1">
      <rect class="la" x="13" y="27" width="5" height="6" rx="2.5"/><rect class="lb" x="18" y="27" width="5" height="6" rx="2.5"/>
      <rect class="lb" x="27" y="27" width="4.5" height="6" rx="2.2"/><rect class="la" x="31.5" y="27" width="4.5" height="6" rx="2.2"/>
    </g>
    <g class="body-g">
      <circle class="tail" style="transform-origin: 50% 50%" cx="9.5" cy="20" r="3.6" fill="#fff"/>
      <ellipse cx="22" cy="23" rx="12" ry="8" fill="#f1f5f9"/>
      <ellipse cx="33" cy="4.5" rx="2.6" ry="7" transform="rotate(-12 33 4.5)" fill="#f1f5f9"/>
      <ellipse cx="33" cy="5" rx="1.2" ry="5" transform="rotate(-12 33 5)" fill="#fbcfe8"/>
      <ellipse cx="38.5" cy="4" rx="2.6" ry="7" transform="rotate(10 38.5 4)" fill="#f1f5f9"/>
      <ellipse cx="38.5" cy="4.5" rx="1.2" ry="5" transform="rotate(10 38.5 4.5)" fill="#fbcfe8"/>
      <circle cx="36" cy="15" r="7.5" fill="#f1f5f9"/>
      <ellipse class="eye" cx="34" cy="14" rx="1.1" ry="1.6" fill="#1c1917"/><ellipse class="eye" cx="39" cy="14" rx="1.1" ry="1.6" fill="#1c1917"/>
      <path class="closed" d="M32.8 14.4 q1.2 1 2.4 0 M37.8 14.4 q1.2 1 2.4 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <circle cx="42.6" cy="16.5" r="1" fill="#f472b6"/>
      <circle cx="33" cy="17.5" r="1.2" fill="#f9a8d4" opacity=".7"/>
    </g>`,
};
