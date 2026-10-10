// Hyacinth macaw: hops, flaps and makes a scene; a long cobalt tail.
export default {
  color: '#1d4ed8',
  speed: .95,
  hop: true,
  mouth: [38.6, 14.8],   // where it opens its mouth to yawn
  acts: [{ name: 'jump', w: 1.5, dur: [.7, 1.2], jump: true }, { name: 'turn', w: 1, dur: [1, 2], turn: true }, { name: 'flap', w: 1.2, dur: [1.2, 2], pose: 'flap' }, { name: 'talk', w: .8, dur: [1.4, 2], say: 'hello' }, { name: 'hang', w: .8, dur: [2.6, 4], pose: 'hang' }],
  poses: {
    // flaps its wings
    flap: { frames: ['a', 'b'], every: .16, move: t => ({ dy: -2 * Math.abs(Math.sin(t * 19.6)) }) },
    // hangs upside down from a branch, swinging
    hang: { move: t => ({ rot: 180 + 8 * Math.sin(t * 3), dy: -36 }) },
    // asleep with its head tucked into its back
    sleep: {},
  },
  // what it does for each care action (Tamagotchi mode, poses.js carePose)
  care: {
    // leans its head in, crest up
    pet: { dur: 2, def: { shut: true, move: t => ({ rot: 8 * Math.min(1, t / .4) }) } },
    // cracks a nut with its beak
    feed: { dur: 2.6, def: { move: t => ({ dy: Math.abs(Math.sin(t * 9)) }), prop: { svg: '<text font-size="8" text-anchor="middle" dominant-baseline="central">🌰</text>', at: t => { const s = 1 - Math.floor(t / 0.75) * .34; return s > .05 ? { x: 41.6, y: 16.6, s } : null; } } } },
    // hangs upside down from a branch, swinging
    play: { pose: 'hang', dur: 3 },
    // a rain shower, wings spread
    clean: { dur: 2.6, def: { frames: ['a', 'b'], every: .3, shut: true } },
    // "curupaco!", and down the pill goes
    medicine: { dur: 2, say: 'hello', def: { prop: { svg: '<text font-size="8" text-anchor="middle" dominant-baseline="central">💊</text>', at: t => (t > .9 ? null : { x: 46 - t * 6, y: 8 + t * 7 }) } } },
  },
  svg: `
    <g class="legs" fill="#52525b">
      <rect class="la" x="21" y="27" width="2.4" height="6" rx="1"/><rect class="lb" x="26" y="27" width="2.4" height="6" rx="1"/>
    </g>
    <g class="body-g">
      <path class="tail" d="M17 24 L3 31 L6 33.5 L19 27.5z M18 26 L7 34 L10.5 35 L20 28z" fill="#1d4ed8"/>
      <ellipse cx="24" cy="20" rx="8" ry="9.5" fill="#2563eb" stroke="#60a5fa" stroke-width=".7" transform="rotate(-8 24 20)"/>
      <path d="M17.5 15.5 q7.5 -2 10.5 6.5 q-6.5 4 -10.5 -6.5z" fill="#1d4ed8" data-hide="flap care-clean sleep"/>
      <circle cx="31" cy="11.5" r="6.8" fill="#2563eb" stroke="#60a5fa" stroke-width=".7" data-hide="sleep"/>
      <circle cx="32.8" cy="10.6" r="2.8" fill="#fde047" data-hide="sleep"/>
      <circle class="eye" cx="33" cy="10.6" r="1.4" fill="#1c1917" data-hide="sleep"/><circle class="eye" cx="33.5" cy="9.9" r=".5" fill="#ffffff" data-hide="sleep"/>
      <path class="closed" d="M31.4 11.0 q1.6 1.3 3.2 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round" data-hide="sleep"/>
      <path d="M36.5 10.5 q5.5 0 5 6 q-1.8 -2.4 -5 -2.2z" fill="#27272a" data-hide="sleep"/>
      <path d="M36.3 14 q2 .4 2.8 2" stroke="#fde047" stroke-width="1.4" fill="none" stroke-linecap="round" data-hide="sleep"/>
      <circle cx="30.2" cy="14.8" r="1.2" fill="#f9a8d4" opacity=".55" data-hide="sleep"/>
      <path data-pose="flap:a care-clean:a care-clean:b" d="M18 16 q-1 -12 12 -9 q-4 6 -12 9z" fill="#1d4ed8"/>
      <path data-pose="flap:b" d="M18 17 q4 11 12 4z" fill="#1d4ed8"/>
      <path data-pose="hang" d="M12 33.6 H36" stroke="#92400e" stroke-width="2.4" stroke-linecap="round"/>
      <path data-pose="hang" d="M30 33.6 l4 2" stroke="#4ade80" stroke-width="1.6" stroke-linecap="round"/>
      <path data-pose="care-pet" d="M27 5 l-1 -4 M30 4.6 l.4 -4 M33 5.4 l1.6 -3.6" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round"/>
      <g data-pose="care-clean:a care-clean:b" stroke="#7dd3fc" stroke-width="1" stroke-linecap="round"><path d="M6 2 l-.8 2.6 M14 6 l-.8 2.6 M40 3 l-.8 2.6 M46 12 l-.8 2.6"/></g>
      <g data-pose="care-clean:b" stroke="#7dd3fc" stroke-width="1" stroke-linecap="round"><path d="M8 10 l-.8 2.6 M38 9 l-.8 2.6 M44 1 l-.8 2.6"/></g>
      <g data-pose="sleep"><ellipse cx="27" cy="13" rx="5.5" ry="4.5" fill="#2563eb" stroke="#60a5fa" stroke-width=".7"/><path d="M22 14 q5 -6 11 -1" stroke="#1d4ed8" stroke-width="2" fill="none"/></g>
    </g>`,
};
