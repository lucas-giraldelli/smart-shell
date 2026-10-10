// Waddles along; stops to preen.
export default {
  color: '#facc15',
  speed: .8,
  waddle: true,
  acts: [{ name: 'stand', w: 4, dur: [2, 5] }],
  svg: `
    <g class="legs" fill="#f97316">
      <rect class="la" x="19" y="26" width="2.6" height="7" rx="1.2"/><rect class="lb" x="25" y="26" width="2.6" height="7" rx="1.2"/>
    </g>
    <g class="body-g">
      <path class="tail" d="M12 20 L6 15 L9 21z" fill="#eab308"/>
      <ellipse cx="22" cy="22" rx="12" ry="7.5" fill="#facc15"/>
      <path d="M14 20 q7 7 14 0" stroke="#eab308" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <circle cx="33" cy="12" r="7" fill="#facc15"/>
      <path d="M38.5 12.5 q6 -.5 6.5 1.5 q-.5 2 -6.5 1.6z" fill="#f97316"/>
      <path d="M38.8 14.1 q3 .5 6 -.2" stroke="#c2410c" stroke-width=".6" fill="none" stroke-linecap="round"/>
      <ellipse class="eye" cx="35" cy="10.5" rx="1.5" ry="2" fill="#1c1917"/><circle class="eye" cx="35.5" cy="9.7" r=".55" fill="#ffffff"/>
      <path class="closed" d="M33.3 10.9 q1.7 1.3 3.4 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <circle cx="32" cy="14.4" r="1.3" fill="#fb923c" opacity=".55"/>
    </g>`,
};
