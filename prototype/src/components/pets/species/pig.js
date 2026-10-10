// Round and pink; lies down in the sun now and then, and sniffs around.
export default {
  color: '#f9a8c0',
  speed: .8,
  acts: [{ name: 'lie', w: 1.6, dur: [4, 9], pose: 'lie' }, { name: 'sniff', w: 1.4, dur: [1.5, 3], speed: 10 }],
  svg: `
    <g class="legs" fill="#e88aa8">
      <rect class="la" x="12" y="25" width="4.5" height="8" rx="2"/><rect class="lb" x="17" y="25" width="4.5" height="8" rx="2"/>
      <rect class="lb" x="28" y="25" width="4.5" height="8" rx="2"/><rect class="la" x="33" y="25" width="4.5" height="8" rx="2"/>
    </g>
    <g class="body-g">
      <path class="tail" d="M9 18 c-3 -1 -4 2 -2 3 c2 1 3 -2 0 -3.5" stroke="#e88aa8" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <ellipse cx="23" cy="19" rx="14.5" ry="9.5" fill="#f9a8c0"/>
      <circle cx="37" cy="15" r="8" fill="#f9a8c0"/>
      <path d="M31.5 9.5 L35 4 L37.5 8.5z" fill="#f48fb1"/><path d="M38.5 7.5 L44 3.5 L43.5 10z" fill="#f48fb1"/>
      <ellipse cx="44" cy="17" rx="3.4" ry="2.8" fill="#f48fb1"/>
      <ellipse cx="43.1" cy="17" rx=".6" ry=".9" fill="#9d4b67"/><ellipse cx="45.1" cy="17" rx=".6" ry=".9" fill="#9d4b67"/>
      <ellipse class="eye" cx="36" cy="13.4" rx="1.1" ry="1.4" fill="#1c1917"/><ellipse class="eye" cx="40.4" cy="13" rx="1" ry="1.3" fill="#1c1917"/>
      <path class="closed" d="M34.8 13.8 q1.2 1 2.4 0 M39.3 13.4 q1.1 .9 2.2 0" stroke="#1c1917" stroke-width="1" fill="none" stroke-linecap="round"/>
      <ellipse cx="34" cy="17.6" rx="1.5" ry=".9" fill="#f472b6" opacity=".45"/>
    </g>`,
};
