// Never runs, whatever the CPU does. Mostly lies down.
export default {
  color: '#a0703f',
  speed: .55,
  chill: true,
  acts: [{ name: 'lie', w: 4, dur: [6, 14], pose: 'lie' }, { name: 'nap', w: 2, dur: [8, 16], pose: 'sleep' }],
  svg: `
    <g class="legs" fill="#6b4a2f">
      <rect class="la" x="11" y="25" width="4.5" height="8" rx="2"/><rect class="lb" x="16" y="25" width="4.5" height="8" rx="2"/>
      <rect class="lb" x="27" y="25" width="4.5" height="8" rx="2"/><rect class="la" x="31.5" y="25" width="4.5" height="8" rx="2"/>
    </g>
    <g class="body-g">
      <rect x="7" y="11" width="29" height="17" rx="8.5" fill="#a0703f"/>
      <rect x="28" y="7" width="16" height="12" rx="5.5" fill="#a0703f"/>
      <rect x="38" y="9.5" width="7" height="8.5" rx="3.5" fill="#8a5d33"/>
      <ellipse cx="43" cy="12" rx=".8" ry=".6" fill="#3b2618"/>
      <ellipse cx="31" cy="7.6" rx="2" ry="1.6" fill="#8a5d33"/>
      <ellipse class="eye" cx="35.5" cy="11.5" rx="1" ry="1.2" fill="#1c1917"/>
      <path class="closed" d="M34.4 11.8 q1.1 .9 2.2 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <circle cx="34" cy="4.6" r="3.1" fill="#fb923c"/>
      <path d="M34 1.6 q2 -1.6 3.6 -.4 q-1.6 1.4 -3.6 .4z" fill="#4ade80"/>
    </g>`,
};
