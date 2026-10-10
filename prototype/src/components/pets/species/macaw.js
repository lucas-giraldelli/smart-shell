// Hyacinth macaw: hops, flaps and makes a scene; a long cobalt tail.
export default {
  color: '#1d4ed8',
  speed: .95,
  hop: true,
  acts: [{ name: 'jump', w: 1.5, dur: [.7, 1.2], jump: true }, { name: 'turn', w: 1, dur: [1, 2], turn: true }, { name: 'flap', w: 1.2, dur: [1.2, 2], pose: 'flap' }, { name: 'talk', w: .8, dur: [1.4, 2], say: 'hello' }],
  poses: {
    // flaps its wings
    flap: { frames: ['a', 'b'], every: .16, move: t => ({ dy: -2 * Math.abs(Math.sin(t * 19.6)) }) },
  },
  svg: `
    <g class="legs" fill="#52525b">
      <rect class="la" x="21" y="27" width="2.4" height="6" rx="1"/><rect class="lb" x="26" y="27" width="2.4" height="6" rx="1"/>
    </g>
    <g class="body-g">
      <path class="tail" d="M17 24 L3 31 L6 33.5 L19 27.5z M18 26 L7 34 L10.5 35 L20 28z" fill="#1d4ed8"/>
      <ellipse cx="24" cy="20" rx="8" ry="9.5" fill="#2563eb" stroke="#60a5fa" stroke-width=".7" transform="rotate(-8 24 20)"/>
      <path d="M17.5 15.5 q7.5 -2 10.5 6.5 q-6.5 4 -10.5 -6.5z" fill="#1d4ed8" data-hide="flap"/>
      <circle cx="31" cy="11.5" r="6.8" fill="#2563eb" stroke="#60a5fa" stroke-width=".7"/>
      <circle cx="32.8" cy="10.6" r="2.8" fill="#fde047"/>
      <circle class="eye" cx="33" cy="10.6" r="1.4" fill="#1c1917"/><circle class="eye" cx="33.5" cy="9.9" r=".5" fill="#ffffff"/>
      <path class="closed" d="M31.4 11.0 q1.6 1.3 3.2 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <path d="M36.5 10.5 q5.5 0 5 6 q-1.8 -2.4 -5 -2.2z" fill="#27272a"/>
      <path d="M36.3 14 q2 .4 2.8 2" stroke="#fde047" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <circle cx="30.2" cy="14.8" r="1.2" fill="#f9a8d4" opacity=".55"/>
      <path data-pose="flap:a" d="M18 16 q-1 -12 12 -9 q-4 6 -12 9z" fill="#1d4ed8"/>
      <path data-pose="flap:b" d="M18 17 q4 11 12 4z" fill="#1d4ed8"/>
    </g>`,
};
