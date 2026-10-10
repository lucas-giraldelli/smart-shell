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
      <ellipse cx="33" cy="22" rx="6" ry="2.2" fill="#f48fb1" opacity=".5"/>
      <circle cx="37" cy="15" r="8" fill="#f9a8c0"/>
      <path d="M31.5 9.5 L35 4 L37.5 8.5z" fill="#f48fb1"/><path d="M38.5 7.5 L44 3.5 L43.5 10z" fill="#f48fb1"/>
      <ellipse cx="44" cy="17" rx="3.4" ry="2.8" fill="#f48fb1"/>
      <ellipse cx="43.1" cy="17" rx=".6" ry=".9" fill="#9d4b67"/><ellipse cx="45.1" cy="17" rx=".6" ry=".9" fill="#9d4b67"/>
      <ellipse class="eye" cx="35.8" cy="13.2" rx="1.4" ry="1.8" fill="#1c1917"/><ellipse class="eye" cx="40.4" cy="13" rx="1.4" ry="1.8" fill="#1c1917"/><circle class="eye" cx="36.3" cy="12.4" r=".55" fill="#ffffff"/><circle class="eye" cx="40.9" cy="12.2" r=".55" fill="#ffffff"/>
      <path class="closed" d="M34.2 13.6 q1.6 1.3 3.2 0 M38.8 13.4 q1.6 1.3 3.2 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <path d="M41.2 20.6 q1.6 1.1 3.2 0" stroke="#9d4b67" stroke-width=".8" fill="none" stroke-linecap="round"/>
      <circle cx="33.8" cy="17.4" r="1.4" fill="#f472b6" opacity=".7"/>
    </g>`,
};
