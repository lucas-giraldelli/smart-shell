// Slow and round; sits down to munch and naps a lot.
export default {
  color: '#f4f4f5',
  speed: .65,
  acts: [{ name: 'lie', w: 2, dur: [5, 9], pose: 'lie' }, { name: 'nap', w: 2, dur: [7, 14], pose: 'sleep' }],
  svg: `
    <g class="legs" fill="#18181b">
      <rect class="la" x="12" y="24" width="5.5" height="9" rx="2.5"/><rect class="lb" x="18" y="24" width="5.5" height="9" rx="2.5"/>
      <rect class="lb" x="27" y="24" width="5.5" height="9" rx="2.5"/><rect class="la" x="33" y="24" width="5.5" height="9" rx="2.5"/>
    </g>
    <g class="body-g">
      <circle class="tail" cx="9.5" cy="19" r="2.2" fill="#f4f4f5"/>
      <ellipse cx="23" cy="21.5" rx="14.5" ry="9" fill="#f4f4f5"/>
      <path d="M26 15 q4 -2.5 8 0 q1 5 -1.5 11 q-3 1 -5 -1 q-1.5 -5 -1.5 -10z" fill="#18181b"/>
      <circle cx="31.5" cy="6.5" r="3" fill="#18181b"/><circle cx="42.5" cy="6.5" r="3" fill="#18181b"/>
      <circle cx="37" cy="13" r="8.5" fill="#f4f4f5"/>
      <ellipse cx="33.8" cy="12.2" rx="2.4" ry="3" fill="#18181b" transform="rotate(-20 33.8 12.2)"/>
      <ellipse cx="40.4" cy="12.2" rx="2.4" ry="3" fill="#18181b" transform="rotate(20 40.4 12.2)"/>
      <circle class="eye" cx="34.1" cy="12" r="1.3" fill="#ffffff"/><circle class="eye" cx="40.1" cy="12" r="1.3" fill="#ffffff"/>
      <circle class="eye" cx="34.4" cy="12.3" r=".6" fill="#18181b"/><circle class="eye" cx="40.4" cy="12.3" r=".6" fill="#18181b"/>
      <path class="closed" d="M32.8 12.4 q1.3 1.1 2.6 0 M38.8 12.4 q1.3 1.1 2.6 0" stroke="#ffffff" stroke-width=".9" fill="none" stroke-linecap="round"/>
      <ellipse cx="37.2" cy="16.4" rx="1.4" ry="1" fill="#18181b"/>
      <path d="M36 18 q1.2 1 2.4 0" stroke="#18181b" stroke-width=".8" fill="none" stroke-linecap="round"/>
      <circle cx="32.4" cy="16.4" r="1.2" fill="#f9a8d4" opacity=".6"/><circle cx="42" cy="16.4" r="1.2" fill="#f9a8d4" opacity=".6"/>
    </g>`,
};
