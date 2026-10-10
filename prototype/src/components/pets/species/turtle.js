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
      <rect x="35" y="19.5" width="7" height="6.5" rx="3" fill="#84cc16"/>
      <path d="M8 27 q15 -22 31 0z" fill="#16a34a"/>
      <path d="M13 26 q3 -7 8 -9 M21 17 q5 3 6 9 M17 26 q4 -5 4 -9 M26 21 q4 1 7 5" stroke="#4ade80" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <path d="M17 19.5 q6 -4.5 12 0" stroke="#86efac" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".7"/>
      <path d="M7.5 27 q16 3 32 0" stroke="#a3e635" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="42" cy="19.5" rx="6.5" ry="5.5" fill="#84cc16"/>
      <ellipse class="eye" cx="43.6" cy="18.4" rx="1.5" ry="1.9" fill="#1c1917"/><circle class="eye" cx="44.1" cy="17.6" r=".55" fill="#ffffff"/>
      <path class="closed" d="M41.9 18.8 q1.7 1.3 3.4 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <path d="M44.4 22 q1.4 1 2.8 0" stroke="#1c1917" stroke-width=".8" fill="none" stroke-linecap="round"/>
      <circle cx="41" cy="21.6" r="1.2" fill="#fb7185" opacity=".5"/>
    </g>`,
};
