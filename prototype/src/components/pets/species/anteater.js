// Tamanduá-bandeira: ambles with its nose down, a big bushy tail.
export default {
  color: '#78716c',
  speed: .7,
  acts: [{ name: 'stroll', w: 5, dur: [4, 8], speed: 22 }],
  svg: `
    <g class="legs" fill="#44403c">
      <rect class="la" x="13" y="24" width="4" height="9" rx="2"/><rect class="lb" x="18" y="24" width="4" height="9" rx="2"/>
      <rect class="lb" x="27" y="24" width="4" height="9" rx="2"/><rect class="la" x="32" y="24" width="4" height="9" rx="2"/>
    </g>
    <g class="body-g">
      <path class="tail" d="M11 21 C2 22 -1 12 4 7 C9 9 12 15 13 19z" fill="#57534e"/>
      <ellipse cx="23" cy="20.5" rx="13" ry="7.5" fill="#a8a29e"/>
      <path d="M33 14 L16 23 L20 25 L35 17z" fill="#1c1917"/>
      <path d="M32.5 13.6 L17 22" stroke="#f5f5f4" stroke-width="1.2" fill="none"/>
      <ellipse cx="35.5" cy="16" rx="4.5" ry="4" fill="#a8a29e"/>
      <path d="M38 14 Q46 17 46 22 Q44 22.5 37 19z" fill="#a8a29e"/>
      <circle cx="34" cy="12.6" r="1.6" fill="#78716c"/>
      <circle class="eye" cx="37.6" cy="15.6" r=".9" fill="#1c1917"/>
      <path class="closed" d="M36.6 15.9 q1 .8 2 0" stroke="#1c1917" stroke-width=".9" fill="none" stroke-linecap="round"/>
      <circle cx="45.6" cy="21.6" r=".8" fill="#1c1917"/>
    </g>`,
};
