// Moves by hopping; stops to croak (throat pouch) or to catch a fly (tongue).
export default {
  color: '#5cbf60',
  speed: 1,
  hop: true,
  mouth: [33, 22.4],   // where it opens its mouth to yawn
  click: 'croak',
  acts: [
    { name: 'stand', w: 4, dur: [2, 5] },
    { name: 'croak', w: 2, dur: [1.5, 3], pose: 'croak' },
    { name: 'tongue', w: 1.5, dur: [1.2, 2.4], pose: 'tongue' },
    { name: 'jump', w: 1, dur: [.7, 1.1], jump: true }, { name: 'fly', w: 1.6, dur: [2.6, 3], pose: 'fly' }, { name: 'leaf', w: 1, dur: [3, 5], pose: 'leaf' }],
  poses: {
    // a fly buzzes around, the tongue snaps it, a gulp. The fly is a prop of
    // its own: it wanders freely, then lands where the tongue reaches
    fly: {
      frames: ['w', 't', 'g'], every: [1.5, .35, .7], once: true,
      prop: {
        svg: '<ellipse cx="-.4" cy="-1.3" rx="1.8" ry="1" fill="#e2e8f0" opacity=".85"/><circle cx="0" cy=".2" r="1.2" fill="#1c1917"/>',
        at: t => {
          if (t > 1.85) return null;
          const k = Math.min(1, t / 1.5) ** 3;
          const x = 49 + 4.5 * Math.sin(t * 6.1), y = 9 + 3.5 * Math.sin(t * 8.7 + 1);
          return { x: x + (47.6 - x) * k, y: y + (13.8 - y) * k };
        },
      },
    },
    // holds a big leaf over its head as an umbrella; it rains around it
    leaf: { frames: ['a', 'b', 'c'], every: .18 },
    // asleep on a lily pad
    sleep: {},
  },
  // what it does for each care action (Tamagotchi mode, poses.js carePose)
  care: {
    // its fly, caught with the tongue
    feed: { dur: 2.7, def: {
      frames: ['w', 't', 'g'], every: [1.5, .35, .7], once: true,
      prop: { svg: '<ellipse cx="-.4" cy="-1.3" rx="1.8" ry="1" fill="#e2e8f0" opacity=".85"/><circle cx="0" cy=".2" r="1.2" fill="#1c1917"/>',
        at: t => { if (t > 1.85) return null; const k = Math.min(1, t / 1.5) ** 3, x = 49 + 4.5 * Math.sin(t * 6.1), y = 9 + 3.5 * Math.sin(t * 8.7 + 1); return { x: x + (47.6 - x) * k, y: y + (13.8 - y) * k }; } },
    } },
    // hops after a firefly
    play: { dur: 3, def: {
      move: t => ({ dy: -7 * Math.abs(Math.sin(t * 4.2)), flip: Math.floor(t / 1.5) % 2 === 1 }),
      prop: { svg: '<circle r="2.8" fill="#fde047" opacity=".3"/><circle r="1.3" fill="#fde047"/>', at: t => ({ x: 44 + 6 * Math.sin(t * 2.3), y: 6 + 4 * Math.sin(t * 3.7) }) },
    } },
    // its throat puffs up with joy, eyes shut
    pet: { dur: 1.8, def: { frames: ['a', 'b'], every: .3, shut: true } },
    // a rain shower, eyes shut, smiling
    clean: { dur: 2.6, def: { frames: ['a', 'b', 'c'], every: .18, shut: true } },
    // the tongue snaps the pill out of the air
    medicine: { dur: 2.2, def: {
      frames: ['w', 't', 'g'], every: [.9, .35, .95], once: true,
      prop: { svg: '<text font-size="6" text-anchor="middle" dominant-baseline="central">💊</text>', at: t => (t > 1.25 ? null : { x: 52 - 4.4 * Math.min(1, t / .9), y: 8 + 5.8 * Math.min(1, t / .9) }) },
    } },
  },
  svg: `
    <g class="legs" fill="#3f9d4a">
      <rect class="la" x="11" y="27" width="7" height="6" rx="3"/>
      <rect class="lb" x="30" y="28" width="5" height="5" rx="2.5"/>
    </g>
    <g class="body-g">
      <path data-pose="sleep" d="M3 29.5 Q24 24 45 29.5 Q24 35 3 29.5z M24 29.5 L33 26.6 L34 30z" fill="#16a34a" fill-rule="evenodd"/>
      <ellipse cx="14" cy="25" rx="7" ry="5.5" fill="#4caf50"/>
      <ellipse cx="24" cy="23" rx="13" ry="9" fill="#5cbf60"/>
      <circle cx="18" cy="18" r="1.6" fill="#43a047"/><circle cx="22" cy="16.5" r="1.2" fill="#43a047"/><circle cx="15" cy="21" r="1.1" fill="#43a047"/>
      <ellipse cx="25" cy="27.5" rx="9" ry="4" fill="#cdeeb5"/>
      <ellipse class="pouch" cx="33" cy="25.5" rx="4" ry="3" fill="#e4f7d6"/>
      <circle cx="27" cy="13" r="4.5" fill="#5cbf60"/><circle cx="35" cy="13" r="4.5" fill="#5cbf60"/>
      <circle cx="27.5" cy="12.5" r="3" fill="#fff"/><circle cx="35.5" cy="12.5" r="3" fill="#fff"/>
      <ellipse class="eye" cx="28.3" cy="12.6" rx="1.4" ry="1.8" fill="#1c1917"/><ellipse class="eye" cx="36.3" cy="12.6" rx="1.4" ry="1.8" fill="#1c1917"/>
      <path class="closed" d="M25.2 12.8 q2.4 1.6 4.8 0 M33.2 12.8 q2.4 1.6 4.8 0" stroke="#1c1917" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <circle cx="31" cy="19" r="1.4" fill="#fb7185" opacity=".55"/>
      <path d="M29.5 21 q3.2 2.2 6.6 -.4" stroke="#2e7d32" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <path class="tongue" d="M37.5 20.6 L46 18.5" stroke="#f472b6" stroke-width="1.8" stroke-linecap="round"/>
      <circle class="tongue fly-tip" cx="46.2" cy="18.4" r="1.4" fill="#f472b6"/>
      <path data-pose="fly:t care-feed:t care-medicine:t" d="M36 20.4 L47.5 13.8" stroke="#f472b6" stroke-width="1.8" stroke-linecap="round"/>
      <ellipse data-pose="fly:g care-feed:g care-medicine:g" cx="33" cy="25.5" rx="5.6" ry="4.2" fill="#e4f7d6"/>
      <path data-pose="leaf" d="M30 22 L28 7" stroke="#2e7d32" stroke-width="1.2" stroke-linecap="round"/>
      <path data-pose="leaf:a leaf:c" d="M17 9 Q28 -2 39 8 Q28 4 17 9z" fill="#22c55e" stroke="#15803d" stroke-width=".6"/>
      <path data-pose="leaf:b" d="M17 8.4 Q28 -2.6 39 7.4 Q28 3.4 17 8.4z" fill="#22c55e" stroke="#15803d" stroke-width=".6"/>
      <ellipse data-pose="leaf" cx="30.5" cy="22" rx="2" ry="1.6" fill="#5cbf60"/>
      <path data-pose="leaf:a care-clean:a" d="M13 6 l-.8 2.6 M43 12 l-.8 2.6 M10 20 l-.8 2.6 M46 24 l-.8 2.6 M15 28 l-.8 2.6" stroke="#7dd3fc" stroke-width="1" stroke-linecap="round"/>
      <path data-pose="leaf:b care-clean:b" d="M13 13 l-.8 2.6 M43 19 l-.8 2.6 M10 27 l-.8 2.6 M46 5 l-.8 2.6 M15 2 l-.8 2.6" stroke="#7dd3fc" stroke-width="1" stroke-linecap="round"/>
      <path data-pose="leaf:c care-clean:c" d="M13 20 l-.8 2.6 M43 26 l-.8 2.6 M10 4 l-.8 2.6 M46 12 l-.8 2.6 M15 9 l-.8 2.6" stroke="#7dd3fc" stroke-width="1" stroke-linecap="round"/>
      <ellipse data-pose="care-pet:b" cx="33" cy="25.5" rx="5.4" ry="4" fill="#e4f7d6"/>
    </g>`,
};
