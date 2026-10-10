// A black cat with yellow eyes; lies down and naps between strolls.
export default {
  color: '#27272a',
  mouth: [39.4, 17.8],   // where it opens its mouth to yawn
  food: '🐟',            // what it eats (Tamagotchi mode)
  bath: -1,              // a bath: 1 loves it, -1 sulks (default 0, doesn't mind)
  acts: [{ name: 'lie', w: 2, dur: [5, 10], pose: 'lie' }, { name: 'nap', w: 1, dur: [6, 12], pose: 'sleep' }, { name: 'pounce', w: .6, dur: [.5, .9], jump: true }, { name: 'arch', w: 1, dur: [1.4, 2.4], pose: 'arch' }, { name: 'talk', w: .6, dur: [1.2, 1.8], say: 'hiss' }, { name: 'dark', w: 1, dur: [2.4, 4], pose: 'dark' }],
  poses: {
    // spooked: back arched, fur on end, trembling
    arch: { move: t => ({ dy: -1, dx: .5 * Math.sin(t * 40) }) },
    // vanishes into the dark: only its eyes, blinking
    dark: { frames: ['a', 'a', 'a', 'b'], every: .35 },
    // asleep: gone into the dark, eyes closed
    sleep: {},
  },
  // what it does for each care action (Tamagotchi mode, poses.js carePose)
  care: {
    // a slow blink: a cat's kiss
    pet: { dur: 2.4, def: { frames: ['o', 'c'], every: .6 } },
    // its fish, eyes glowing
    feed: { dur: 2.4, def: {
      frames: ['o', 'c'], every: .22, move: t => ({ dy: .8 * Math.sin(t * 14) }),
      prop: { svg: '<text font-size="9" text-anchor="middle" dominant-baseline="central">🐟</text>', at: t => { const s = 1 - Math.floor(t / .7) * .34; return s > .05 ? { x: 43.4, y: 18.3, s } : null; } },
    } },
    // chases a laser dot along the floor
    play: { dur: 3, def: {
      move: t => ({ dy: -3 * Math.abs(Math.sin(t * 7)), flip: Math.cos(t * 2.4) < 0 }),
      prop: { svg: '<circle r="2" fill="#ef4444" opacity=".35"/><circle r="1" fill="#f87171"/>', at: t => ({ x: 23 + 22 * Math.sin(t * 2.4), y: 34.5 }) },
    } },
    // grooms itself, then shivers its fur back down
    clean: { dur: 2.6, def: { frames: ['a', 'b'], every: .28, shut: true, move: t => (t < 1.9 ? { rot: -1.5 * Math.sin(t * 11) } : { dx: .8 * Math.sin(t * 70) }) } },
    // a hiss at the pill, then down it goes
    medicine: { dur: 2.2, say: 'hiss', def: {
      frames: ['c', 'o', 'c'], every: [.9, .5, .8], once: true,
      prop: { svg: '<text font-size="8" text-anchor="middle" dominant-baseline="central">💊</text>', at: t => (t < .9 || t > 1.4 ? null : { x: 47 - (t - .9) * 8, y: 14 + (t - .9) * 7 }) },
    } },
  },
  svg: `
    <g class="legs" fill="#18181b" data-hide="dark sleep">
      <rect class="la" x="12" y="24" width="4" height="9" rx="2"/><rect class="lb" x="17" y="24" width="4" height="9" rx="2"/>
      <rect class="lb" x="28" y="24" width="4" height="9" rx="2"/><rect class="la" x="33" y="24" width="4" height="9" rx="2"/>
    </g>
    <g class="body-g">
      <g data-hide="dark sleep">
      <path class="tail" d="M10 21 C3 20 1 12 5 7" stroke="#3f3f46" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="23" cy="22" rx="14" ry="8" fill="#27272a" stroke="#52525b" stroke-width=".8" data-hide="arch"/>
      <polygon points="31,8 32,1 37,6" fill="#27272a" stroke="#52525b" stroke-width=".8" stroke-linejoin="round"/><polygon points="39,6 44,1 44,10" fill="#27272a" stroke="#52525b" stroke-width=".8" stroke-linejoin="round"/>
      <polygon points="32.4,6.6 33,3 35.6,5.6" fill="#be185d" opacity=".6"/><polygon points="40,6 43,3 43,8" fill="#be185d" opacity=".6"/>
      <circle cx="37" cy="13" r="8" fill="#27272a" stroke="#52525b" stroke-width=".8"/>
      </g>
      <ellipse class="eye" cx="35.2" cy="12" rx="1.9" ry="2.3" fill="#facc15" data-hide="dark sleep care-pet:c"/><ellipse class="eye" cx="40.6" cy="12" rx="1.9" ry="2.3" fill="#facc15" data-hide="dark sleep care-pet:c"/>
      <ellipse class="eye" cx="35.2" cy="12" rx=".6" ry="1.9" fill="#18181b" data-hide="dark sleep care-pet:c"/><ellipse class="eye" cx="40.6" cy="12" rx=".6" ry="1.9" fill="#18181b" data-hide="dark sleep care-pet:c"/>
      <circle class="eye" cx="35.8" cy="11" r=".5" fill="#ffffff" data-hide="dark sleep care-pet:c"/><circle class="eye" cx="41.2" cy="11" r=".5" fill="#ffffff" data-hide="dark sleep care-pet:c"/>
      <path class="closed" d="M33.1 12.4 q2.1 1.3 4.2 0 M38.5 12.4 q2.1 1.3 4.2 0" stroke="#facc15" stroke-width="1.1" fill="none" stroke-linecap="round" data-hide="dark sleep"/>
      <path d="M39.4 15.2 l-.9 .9 h1.8z" fill="#f472b6" data-hide="dark sleep"/>
      <path data-hide="dark sleep" d="M38 16.7 q.7 .8 1.4 0 q.7 .8 1.4 0" stroke="#a1a1aa" stroke-width=".7" fill="none" stroke-linecap="round"/>
      <path data-hide="dark sleep" d="M44 15 l4 -1 M44 16.5 l4 .5" stroke="#71717a" stroke-width=".5"/>
      <path data-pose="arch" d="M9 26 C9 13 15 8.5 23 8.5 C31 8.5 37 13 37 24 L33 26 Q23 20 13 26z" fill="#27272a" stroke="#52525b" stroke-width=".8"/>
      <path data-pose="arch" d="M12.5 15 l.4 -3.4 l1.6 2.4 l.6 -3.8 l1.8 3 l.8 -3.6 l1.6 3.2 l1.2 -3.4 l1.4 3.2 l1.4 -3 l1.2 3 l1.4 -2.6 l1 2.6" stroke="#71717a" stroke-width="1" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      <ellipse data-pose="dark:a" cx="35.2" cy="12" rx="1.9" ry="2.3" fill="#fde047"/><ellipse data-pose="dark:a" cx="40.6" cy="12" rx="1.9" ry="2.3" fill="#fde047"/>
      <ellipse data-pose="dark:a" cx="35.2" cy="12" rx=".6" ry="1.9" fill="#18181b"/><ellipse data-pose="dark:a" cx="40.6" cy="12" rx=".6" ry="1.9" fill="#18181b"/>
      <path data-pose="dark:b sleep care-pet:c" d="M33.3 12.4 q1.9 1.3 3.8 0 M38.7 12.4 q1.9 1.3 3.8 0" stroke="#fde047" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <circle data-pose="care-feed" cx="35.2" cy="12" r="3.2" fill="#fde047" opacity=".25"/><circle data-pose="care-feed" cx="40.6" cy="12" r="3.2" fill="#fde047" opacity=".25"/>
      <path data-pose="care-clean" d="M33.5 26 Q37 23.5 40.6 20.4" stroke="#18181b" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse data-pose="care-clean" cx="41.2" cy="19.6" rx="2.3" ry="2" fill="#27272a" stroke="#52525b" stroke-width=".6"/>
      <ellipse data-pose="care-clean:b" cx="40" cy="18.2" rx="1.1" ry=".8" fill="#f472b6"/>
    </g>`,
};
