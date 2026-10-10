// Wobbles along on its tentacles; changes direction a lot.
export default {
  color: '#c084fc',
  speed: .75,
  acts: [{ name: 'turn', w: 2, dur: [.8, 1.6], turn: true }],
  svg: `
    <g class="legs" fill="#a855f7">
      <rect class="la" x="12" y="20" width="4" height="13" rx="2"/><rect class="lb" x="18" y="21" width="4" height="12" rx="2"/>
      <rect class="la" x="24" y="21" width="4" height="12" rx="2"/><rect class="lb" x="30" y="20" width="4" height="13" rx="2"/>
    </g>
    <g class="body-g">
      <path d="M10 22 q0 -19 13 -19 q13 0 13 19 q-13 4 -26 0z" fill="#c084fc"/>
      <circle cx="16" cy="9" r="1.6" fill="#e9d5ff" opacity=".7"/><circle cx="19" cy="6" r="1" fill="#e9d5ff" opacity=".7"/>
      <ellipse class="eye" cx="19.5" cy="15" rx="1.6" ry="2.1" fill="#1c1917"/><ellipse class="eye" cx="27" cy="15" rx="1.6" ry="2.1" fill="#1c1917"/>
      <circle class="eye" cx="20" cy="14.2" r=".55" fill="#ffffff"/><circle class="eye" cx="27.5" cy="14.2" r=".55" fill="#ffffff"/>
      <path class="closed" d="M17.8 15.4 q1.7 1.4 3.4 0 M25.3 15.4 q1.7 1.4 3.4 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <circle cx="17" cy="18.4" r="1.3" fill="#f0abfc"/><circle cx="29.5" cy="18.4" r="1.3" fill="#f0abfc"/>
      <path d="M22 18.6 q1.3 1.2 2.6 0" stroke="#1c1917" stroke-width=".8" fill="none" stroke-linecap="round"/>
    </g>`,
};
