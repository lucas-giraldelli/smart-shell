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
      <ellipse cx="22" cy="19.5" rx="15" ry="8.5" fill="#a0703f"/>
      <ellipse cx="21" cy="15" rx="10" ry="3" fill="#b07d4a" opacity=".7"/>
      <ellipse cx="31.2" cy="7.6" rx="2" ry="1.6" fill="#8a5d33"/>
      <ellipse cx="36" cy="13" rx="8" ry="7" fill="#a0703f"/>
      <ellipse cx="41.5" cy="15" rx="4.6" ry="4" fill="#8a5d33"/>
      <ellipse cx="44.4" cy="13.4" rx=".7" ry=".5" fill="#3b2618"/>
      <ellipse class="eye" cx="35" cy="11.6" rx="1.4" ry="1.8" fill="#1c1917"/><circle class="eye" cx="35.5" cy="10.8" r=".55" fill="#ffffff"/>
      <path class="eye" d="M33.5 11.4 a1.5 1.5 0 0 1 3 0z" fill="#8a5d33"/>
      <path class="closed" d="M33.4 12.0 q1.6 1.3 3.2 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <path d="M40.6 17.6 q1.5 1 3 0" stroke="#3b2618" stroke-width=".8" fill="none" stroke-linecap="round"/>
      <circle cx="36.4" cy="15.6" r="1.3" fill="#fb7185" opacity=".5"/>
      <circle cx="35" cy="3.6" r="3" fill="#fb923c"/>
      <path d="M35 .7 q2 -1.6 3.6 -.4 q-1.6 1.4 -3.6 .4z" fill="#4ade80"/>
    </g>`,
};
