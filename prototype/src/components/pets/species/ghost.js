// Floats instead of walking; drifts slowly and fades a little.
export default {
  color: '#f8fafc',
  speed: .7,
  float: true,
  snore: 'boo',            // what floats up while it sleeps (default z)
  acts: [{ name: 'stand', w: 3, dur: [2, 5] }, { name: 'turn', w: 1, dur: [1, 2], turn: true }, { name: 'fade', w: 1, dur: [2.4, 3.6], pose: 'fade' }, { name: 'talk', w: .8, dur: [1.2, 1.8], say: 'boo' }],
  poses: {
    // fades nearly out and back
    fade: { move: t => ({ opacity: .15 + .85 * Math.abs(Math.cos(t * 1.4)) }) },
  },
  svg: `
    <g class="body-g" opacity=".92">
      <path d="M11 30 V16 q0 -12 12 -12 q12 0 12 12 V30 l-3 -2.5 l-3 2.5 l-3 -2.5 l-3 2.5 l-3 -2.5 l-3 2.5 l-3 -2.5z" fill="#f8fafc"/>
      <path d="M31 9 q2.5 3 2.5 8" stroke="#e2e8f0" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <ellipse class="eye" cx="20" cy="15" rx="1.6" ry="2.2" fill="#1e293b"/><ellipse class="eye" cx="27" cy="15" rx="1.6" ry="2.2" fill="#1e293b"/>
      <path class="closed" d="M18.3 15.4 q1.7 1.4 3.4 0 M25.3 15.4 q1.7 1.4 3.4 0" stroke="#1e293b" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <ellipse cx="23.5" cy="20.5" rx="1.6" ry="2" fill="#1e293b"/>
      <circle cx="17" cy="18.6" r="1.4" fill="#fbcfe8" opacity=".7"/><circle cx="30" cy="18.6" r="1.4" fill="#fbcfe8" opacity=".7"/>
    </g>`,
};
