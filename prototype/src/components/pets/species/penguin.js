// Slow and waddles; mostly stands around.
export default {
  color: '#1f2937',
  speed: .7,
  waddle: true,
  acts: [{ name: 'stand', w: 5, dur: [3, 6] }, { name: 'slide', w: 1.2, dur: [1.6, 2.6], pose: 'slide', speed: 60 }, { name: 'talk', w: .7, dur: [1.4, 2], say: 'noot' }],
  poses: {
    // slides on its belly
    slide: { move: () => ({ rot: 80, dy: -8 }) },
  },
  svg: `
    <g class="legs" fill="#f59e0b">
      <rect class="la" x="18" y="30" width="6" height="4" rx="2" data-hide="slide"/><rect class="lb" x="25" y="30" width="6" height="4" rx="2" data-hide="slide"/>
    </g>
    <g class="body-g">
      <ellipse cx="24" cy="19" rx="10" ry="13" fill="#1f2937"/>
      <path class="tail" style="transform-origin: 50% 0%" d="M16 16 q-5 6 -2 11" stroke="#111827" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="26" cy="22" rx="7" ry="9.5" fill="#f8fafc"/>
      <ellipse cx="26" cy="27" rx="5.5" ry="4" fill="#e2e8f0"/>
      <ellipse cx="28" cy="12" rx="6.5" ry="4.8" fill="#f8fafc"/>
      <ellipse class="eye" cx="25.8" cy="11.6" rx="1.4" ry="1.9" fill="#111827"/><ellipse class="eye" cx="30.6" cy="11.6" rx="1.4" ry="1.9" fill="#111827"/><circle class="eye" cx="26.3" cy="10.8" r=".55" fill="#ffffff"/><circle class="eye" cx="31.1" cy="10.8" r=".55" fill="#ffffff"/>
      <path class="closed" d="M24.2 12.0 q1.6 1.3 3.2 0 M29.0 12.0 q1.6 1.3 3.2 0" stroke="#111827" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <polygon points="33,12.5 38.5,13.6 33,15" fill="#f59e0b"/>
      <circle cx="24.6" cy="14.8" r="1.1" fill="#f9a8d4" opacity=".75"/><circle cx="31.6" cy="15" r="1.1" fill="#f9a8d4" opacity=".75"/>
    </g>`,
};
