// Slow and waddles; mostly stands around.
export default {
  color: '#1f2937',
  speed: .7,
  waddle: true,
  acts: [{ name: 'stand', w: 5, dur: [3, 6] }],
  svg: `
    <g class="legs" fill="#f59e0b">
      <rect class="la" x="18" y="30" width="6" height="4" rx="2"/><rect class="lb" x="25" y="30" width="6" height="4" rx="2"/>
    </g>
    <g class="body-g">
      <ellipse cx="24" cy="19" rx="10" ry="13" fill="#1f2937"/>
      <path class="tail" style="transform-origin: 50% 0%" d="M16 16 q-5 6 -2 11" stroke="#111827" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="26" cy="22" rx="7" ry="9.5" fill="#f8fafc"/>
      <ellipse cx="28" cy="12" rx="5.6" ry="4" fill="#f8fafc"/>
      <ellipse class="eye" cx="26" cy="11.5" rx="1.1" ry="1.5" fill="#111827"/><ellipse class="eye" cx="30.5" cy="11.5" rx="1.1" ry="1.5" fill="#111827"/>
      <path class="closed" d="M24.8 11.8 q1.2 1 2.4 0 M29.3 11.8 q1.2 1 2.4 0" stroke="#111827" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <polygon points="33,12.5 38.5,13.6 33,15" fill="#f59e0b"/>
      <circle cx="25" cy="14.6" r="1" fill="#f9a8d4" opacity=".75"/><circle cx="31.4" cy="14.8" r="1" fill="#f9a8d4" opacity=".75"/>
    </g>`,
};
