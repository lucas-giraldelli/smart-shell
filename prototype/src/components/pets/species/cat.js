// Lies down and naps between strolls.
export default {
  color: '#f2a65a',
  acts: [{ name: 'lie', w: 2, dur: [5, 10], pose: 'lie' }, { name: 'nap', w: 1, dur: [6, 12], pose: 'sleep' }],
  svg: `
    <g class="legs" fill="#d9823c">
      <rect class="la" x="12" y="24" width="4" height="9" rx="2"/><rect class="lb" x="17" y="24" width="4" height="9" rx="2"/>
      <rect class="lb" x="28" y="24" width="4" height="9" rx="2"/><rect class="la" x="33" y="24" width="4" height="9" rx="2"/>
    </g>
    <g class="body-g">
      <path class="tail" d="M10 21 C3 20 1 12 5 7" stroke="#e8914a" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="23" cy="22" rx="14" ry="8" fill="#f2a65a"/>
      <path d="M17 15 q1.5 7 0 13 M22 14 q1.5 8 0 15 M27 14.5 q1.5 7 0 14" stroke="#d9823c" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <polygon points="31,8 32,1 37,6" fill="#e8914a"/><polygon points="39,6 44,1 44,10" fill="#e8914a"/>
      <circle cx="37" cy="13" r="8" fill="#f2a65a"/>
      <ellipse cx="39" cy="16.5" rx="4" ry="2.6" fill="#fde7cf"/>
      <ellipse class="eye" cx="35.2" cy="12" rx="1.2" ry="1.7" fill="#1c1917"/><ellipse class="eye" cx="40.6" cy="12" rx="1.2" ry="1.7" fill="#1c1917"/>
      <path class="closed" d="M33.8 12.4 q1.4 1.2 2.8 0 M39.2 12.4 q1.4 1.2 2.8 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <path d="M39.4 15.2 l-.9 .9 h1.8z" fill="#f472b6"/>
    </g>`,
};
