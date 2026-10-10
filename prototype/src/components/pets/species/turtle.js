// Very slow; doesn't care about the CPU at all.
export default {
  color: '#16a34a',
  speed: .35,
  chill: true,
  acts: [{ name: 'stand', w: 5, dur: [3, 7] }, { name: 'nap', w: 2, dur: [8, 14], pose: 'sleep' }],
  svg: `
    <g class="legs" fill="#65a30d">
      <rect class="la" x="11" y="26" width="5" height="7" rx="2.5"/><rect class="lb" x="16.5" y="26" width="5" height="7" rx="2.5"/>
      <rect class="lb" x="26" y="26" width="5" height="7" rx="2.5"/><rect class="la" x="31.5" y="26" width="5" height="7" rx="2.5"/>
    </g>
    <g class="body-g">
      <path class="tail" d="M9 25 l-4 1.5 l4 1.5z" fill="#65a30d"/>
      <path d="M8 27 q15 -22 31 0z" fill="#16a34a"/>
      <path d="M13 26 q3 -7 8 -9 M21 17 q5 3 6 9 M17 26 q4 -5 4 -9 M26 21 q4 1 7 5" stroke="#14532d" stroke-width="1" fill="none" stroke-linecap="round"/>
      <path d="M7 27 h33" stroke="#a3e635" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="40" cy="22" rx="5" ry="4.3" fill="#84cc16"/>
      <rect x="36" y="22" width="5" height="4" rx="2" fill="#84cc16"/>
      <circle class="eye" cx="41.6" cy="20.8" r="1.1" fill="#1c1917"/>
      <path class="closed" d="M40.4 21.1 q1.2 1 2.4 0" stroke="#1c1917" stroke-width="1" fill="none" stroke-linecap="round"/>
      <path d="M42.5 23.6 q1.2 .8 2.2 0" stroke="#1c1917" stroke-width=".7" fill="none" stroke-linecap="round"/>
    </g>`,
};
