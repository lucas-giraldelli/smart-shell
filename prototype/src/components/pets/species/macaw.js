// Hyacinth macaw: hops, flaps and makes a scene; a long cobalt tail.
export default {
  color: '#1d4ed8',
  speed: .95,
  hop: true,
  acts: [{ name: 'jump', w: 1.5, dur: [.7, 1.2], jump: true }, { name: 'turn', w: 1, dur: [1, 2], turn: true }],
  svg: `
    <g class="legs" fill="#52525b">
      <rect class="la" x="21" y="27" width="2.4" height="6" rx="1"/><rect class="lb" x="26" y="27" width="2.4" height="6" rx="1"/>
    </g>
    <g class="body-g">
      <path class="tail" d="M15 24 L1 31 L4 33 L17 27z" fill="#1e40af"/>
      <ellipse cx="23" cy="21" rx="9.5" ry="7.5" fill="#1d4ed8" transform="rotate(-18 23 21)"/>
      <path d="M17 18 q6 -3 11 3 q-6 4 -11 -3z" fill="#2563eb"/>
      <circle cx="31" cy="12" r="6.5" fill="#1d4ed8"/>
      <circle cx="32.6" cy="10.8" r="2.3" fill="#fde047"/>
      <circle class="eye" cx="32.8" cy="10.8" r="1.1" fill="#1c1917"/>
      <path class="closed" d="M31.4 11 q1.4 1.1 2.8 0" stroke="#1c1917" stroke-width="1" fill="none" stroke-linecap="round"/>
      <path d="M36 11 q5 0 4.6 5.4 q-1.6 -2.2 -4.6 -2z" fill="#27272a"/>
      <path d="M35.8 14.2 q1.8 .4 2.6 1.8" stroke="#fde047" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    </g>`,
};
