// A black cat with yellow eyes; lies down and naps between strolls.
export default {
  color: '#27272a',
  mouth: [39.4, 17.8],   // where it opens its mouth to yawn
  acts: [{ name: 'lie', w: 2, dur: [5, 10], pose: 'lie' }, { name: 'nap', w: 1, dur: [6, 12], pose: 'sleep' }, { name: 'pounce', w: .6, dur: [.5, .9], jump: true }, { name: 'arch', w: 1, dur: [1.4, 2.4], pose: 'arch' }, { name: 'talk', w: .6, dur: [1.2, 1.8], say: 'hiss' }, { name: 'dark', w: 1, dur: [2.4, 4], pose: 'dark' }],
  poses: {
    // spooked: back arched, fur on end, trembling
    arch: { move: t => ({ dy: -1, dx: .5 * Math.sin(t * 40) }) },
    // vanishes into the dark: only its eyes, blinking
    dark: { frames: ['a', 'a', 'a', 'b'], every: .35 },
  },
  svg: `
    <g class="legs" fill="#18181b" data-hide="dark">
      <rect class="la" x="12" y="24" width="4" height="9" rx="2"/><rect class="lb" x="17" y="24" width="4" height="9" rx="2"/>
      <rect class="lb" x="28" y="24" width="4" height="9" rx="2"/><rect class="la" x="33" y="24" width="4" height="9" rx="2"/>
    </g>
    <g class="body-g">
      <g data-hide="dark">
      <path class="tail" d="M10 21 C3 20 1 12 5 7" stroke="#3f3f46" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="23" cy="22" rx="14" ry="8" fill="#27272a" stroke="#52525b" stroke-width=".8" data-hide="arch"/>
      <polygon points="31,8 32,1 37,6" fill="#27272a" stroke="#52525b" stroke-width=".8" stroke-linejoin="round"/><polygon points="39,6 44,1 44,10" fill="#27272a" stroke="#52525b" stroke-width=".8" stroke-linejoin="round"/>
      <polygon points="32.4,6.6 33,3 35.6,5.6" fill="#be185d" opacity=".6"/><polygon points="40,6 43,3 43,8" fill="#be185d" opacity=".6"/>
      <circle cx="37" cy="13" r="8" fill="#27272a" stroke="#52525b" stroke-width=".8"/>
      </g>
      <ellipse class="eye" cx="35.2" cy="12" rx="1.9" ry="2.3" fill="#facc15" data-hide="dark"/><ellipse class="eye" cx="40.6" cy="12" rx="1.9" ry="2.3" fill="#facc15" data-hide="dark"/>
      <ellipse class="eye" cx="35.2" cy="12" rx=".6" ry="1.9" fill="#18181b" data-hide="dark"/><ellipse class="eye" cx="40.6" cy="12" rx=".6" ry="1.9" fill="#18181b" data-hide="dark"/>
      <circle class="eye" cx="35.8" cy="11" r=".5" fill="#ffffff" data-hide="dark"/><circle class="eye" cx="41.2" cy="11" r=".5" fill="#ffffff" data-hide="dark"/>
      <path class="closed" d="M33.1 12.4 q2.1 1.3 4.2 0 M38.5 12.4 q2.1 1.3 4.2 0" stroke="#facc15" stroke-width="1.1" fill="none" stroke-linecap="round" data-hide="dark"/>
      <path d="M39.4 15.2 l-.9 .9 h1.8z" fill="#f472b6" data-hide="dark"/>
      <path data-hide="dark" d="M38 16.7 q.7 .8 1.4 0 q.7 .8 1.4 0" stroke="#a1a1aa" stroke-width=".7" fill="none" stroke-linecap="round"/>
      <path data-hide="dark" d="M44 15 l4 -1 M44 16.5 l4 .5" stroke="#71717a" stroke-width=".5"/>
      <path data-pose="arch" d="M9 26 C9 13 15 8.5 23 8.5 C31 8.5 37 13 37 24 L33 26 Q23 20 13 26z" fill="#27272a" stroke="#52525b" stroke-width=".8"/>
      <path data-pose="arch" d="M12.5 15 l.4 -3.4 l1.6 2.4 l.6 -3.8 l1.8 3 l.8 -3.6 l1.6 3.2 l1.2 -3.4 l1.4 3.2 l1.4 -3 l1.2 3 l1.4 -2.6 l1 2.6" stroke="#71717a" stroke-width="1" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      <ellipse data-pose="dark:a" cx="35.2" cy="12" rx="1.9" ry="2.3" fill="#fde047"/><ellipse data-pose="dark:a" cx="40.6" cy="12" rx="1.9" ry="2.3" fill="#fde047"/>
      <ellipse data-pose="dark:a" cx="35.2" cy="12" rx=".6" ry="1.9" fill="#18181b"/><ellipse data-pose="dark:a" cx="40.6" cy="12" rx=".6" ry="1.9" fill="#18181b"/>
      <path data-pose="dark:b" d="M33.3 12.4 q1.9 1.3 3.8 0 M38.7 12.4 q1.9 1.3 3.8 0" stroke="#fde047" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    </g>`,
};
