// A black cat with yellow eyes; lies down and naps between strolls.
export default {
  color: '#27272a',
  acts: [{ name: 'lie', w: 2, dur: [5, 10], pose: 'lie' }, { name: 'nap', w: 1, dur: [6, 12], pose: 'sleep' }, { name: 'pounce', w: .6, dur: [.5, .9], jump: true }],
  svg: `
    <g class="legs" fill="#18181b">
      <rect class="la" x="12" y="24" width="4" height="9" rx="2"/><rect class="lb" x="17" y="24" width="4" height="9" rx="2"/>
      <rect class="lb" x="28" y="24" width="4" height="9" rx="2"/><rect class="la" x="33" y="24" width="4" height="9" rx="2"/>
    </g>
    <g class="body-g">
      <path class="tail" d="M10 21 C3 20 1 12 5 7" stroke="#18181b" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="23" cy="22" rx="14" ry="8" fill="#27272a"/>
      <polygon points="31,8 32,1 37,6" fill="#18181b"/><polygon points="39,6 44,1 44,10" fill="#18181b"/>
      <polygon points="32.4,6.6 33,3 35.6,5.6" fill="#be185d" opacity=".55"/><polygon points="40,6 43,3 43,8" fill="#be185d" opacity=".55"/>
      <circle cx="37" cy="13" r="8" fill="#27272a"/>
      <ellipse class="eye" cx="35.2" cy="12" rx="1.6" ry="2" fill="#facc15"/><ellipse class="eye" cx="40.6" cy="12" rx="1.6" ry="2" fill="#facc15"/>
      <ellipse class="eye" cx="35.2" cy="12" rx=".5" ry="1.6" fill="#18181b"/><ellipse class="eye" cx="40.6" cy="12" rx=".5" ry="1.6" fill="#18181b"/>
      <path class="closed" d="M33.8 12.4 q1.4 1.2 2.8 0 M39.2 12.4 q1.4 1.2 2.8 0" stroke="#facc15" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <path d="M39.4 15.2 l-.9 .9 h1.8z" fill="#f472b6"/>
      <path d="M44 15 l4 -1 M44 16.5 l4 .5" stroke="#52525b" stroke-width=".5"/>
    </g>`,
};
