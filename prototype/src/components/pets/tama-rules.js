// Tamagotchi mode's rules, with no state of their own: the prototype
// (pets/tama.js, the store) and the shell (services/Tama.qml, a state file)
// both run on these. Written for Qt's QML engine too: no spread, no optional
// calls (README "Adding a pet").
//
// The pet has needs that run down over hours:
//   food    fed by Feed; down 12/h
//   fun     raised by Play (costs energy) and a little by Pet; down 10/h
//   clean   down 4/h (by species), and 10/h more per dropping on the dock;
//           Clean restores it
//   energy  down 6/h awake, up 30/h asleep (low CPU, or put to bed)
//   health  falls while it's sick or a need is nearly empty, recovers when fed
//           and happy; at 0 the pet runs away (and comes back as the ghost)
// It drops one every 2.5-4.5 h while fed; dirt, droppings or a hot PC can make
// it sick (Medicine cures it). Each species has its own pace (`pace`) and
// taste for baths (`bath`); a busy CPU tires it a little, a hot one tires it
// and makes it sweat (and can make it sick), a work meeting bores it a little,
// music cheers it up but dancing tires it, and at night (22-6 h) it tires faster and asks for bed
// sooner. Tired (energy under 25) it stops dancing; exhausted (under 10) it
// falls asleep by itself until it's full, and woken up it drops off again a
// minute later if it's still exhausted. It refuses what it doesn't need, and petting it over and over
// pleases it less each time (a cat ends up hissing).

export const NEEDS = ['food', 'fun', 'clean', 'energy', 'health'];
// the sign over its head for its most urgent need
export const SIGN = { food: '🍖', fun: '🎾', clean: '🧼', energy: '💤', sick: '🤒' };

export const fresh = now => ({
  food: 80, fun: 80, clean: 100, energy: 90, health: 100,
  sick: false, poops: [], nextPoop: 3, napping: false, bornAt: now,
});

const clamp = v => Math.max(0, Math.min(100, v));
const pace = (sp, k) => (sp && sp.pace && sp.pace[k] !== undefined ? sp.pace[k] : 1);
const bathOf = sp => (sp && sp.bath !== undefined ? sp.bath : 0);
const night = now => { const h = new Date(now).getHours(); return h >= 22 || h < 6; };
export const foodOf = sp => (sp && sp.food) || '🍖';
// too tired to dance: asleep, or energy under 25
export const tooTired = s => s.napping || s.energy < 25;

// `speed` speeds time up (the prototype's dev panel); 1 is real time
export const ageDays = (s, now, speed) => (now - s.bornAt) * (speed || 1) / 864e5;

// the most urgent need, for the sign over its head ('' = all fine)
export function urgent(s, now) {
  if (s.sick) return 'sick';
  // at night it asks for bed while it still has some energy left
  const low = k => s[k] < (k === 'energy' && night(now) ? 45 : 25);
  return ['food', 'energy', 'clean', 'fun'].filter(low).sort((a, b) => s[a] - s[b])[0] || '';
}

// `dt` seconds pass (times `speed`): the new state, or null when it ran away
//   ctx: { sp (its species), asleep, hot, load (CPU %), music (it hears some),
//          dancing, meeting, now, speed }
export function decay(s, dt, ctx) {
  const sp = ctx.sp, h = dt * (ctx.speed || 1) / 3600;
  const tired = 6 * pace(sp, 'energy') * (night(ctx.now) ? 1.6 : 1) + (ctx.load > 72 ? 1.5 : 0) + (ctx.hot ? 1.5 : 0) + (ctx.dancing ? 3 : 0);
  const n = Object.assign({}, s, {
    food: clamp(s.food - 12 * pace(sp, 'food') * h),
    fun: clamp(s.fun - (10 * pace(sp, 'fun') + (ctx.meeting ? 2 : 0) - (ctx.music ? 6 : 0)) * h),
    // droppings dirty it at the same rate for every species (even the ghost)
    clean: clamp(s.clean - ((4 + (ctx.hot ? 2 : 0)) * pace(sp, 'clean') + 10 * s.poops.length) * h),
    energy: clamp(s.energy + (ctx.asleep || s.napping ? 30 : -tired) * h),
    nextPoop: s.nextPoop - h * (s.food > 30 ? 1 : .3),
  });
  if (n.nextPoop <= 0) {
    if (s.poops.length < 4) n.poops = s.poops.concat([.1 + Math.random() * .8]);
    n.nextPoop = 2.5 + Math.random() * 2;
  }
  if (!s.sick && (n.clean < 25 || n.poops.length >= 3 || ctx.hot) && Math.random() < h * 2) n.sick = true;
  const low = ['food', 'fun', 'clean', 'energy'].filter(k => n[k] < 15).length;
  n.health = clamp(s.health - (s.sick ? 10 : 0) * h - 5 * low * h + (!low && !s.sick && n.food > 50 && n.fun > 50 ? 4 : 0) * h);
  if (s.napping && n.energy >= 100) n.napping = false;
  // exhausted: it falls asleep by itself (not within a minute of being woken)
  if (!s.napping && n.energy < 10 && !(s.wokeAt && ctx.now - s.wokeAt < 60e3)) n.napping = true;
  return n.health === 0 ? null : n;
}

// a care action: { n: the new state (null = nothing changes), say: a word
// (pets.says), effect: the care animation to play (poses.js carePose) }
//   ctx: { sp, kind, petted (recent pets, ms), now }
export function care(s, action, ctx) {
  const n = Object.assign({}, s);
  if (action === 'feed') {
    if (s.food >= 95) return { n: null, say: 'no' };
    return { n: Object.assign(n, { food: clamp(s.food + 30), energy: clamp(s.energy + 5) }), effect: 'feed' };
  }
  if (action === 'play') {
    if (s.energy < 15) return { n: null, say: 'no' };
    return { n: Object.assign(n, { fun: clamp(s.fun + 30), energy: clamp(s.energy - 10), food: clamp(s.food - 5) }), effect: 'play' };
  }
  if (action === 'pet') {
    // each pet in the last 2 minutes halves the next one's joy; a cat has had enough at 4
    const recent = ctx.petted.filter(t => ctx.now - t < 120e3).length + 1;
    if ((ctx.kind === 'cat' || ctx.kind === 'blackcat') && recent >= 4) return { n: Object.assign(n, { fun: clamp(s.fun - 3) }), say: 'hiss' };
    return { n: Object.assign(n, { fun: clamp(s.fun + 8 / Math.pow(2, recent - 1)), health: clamp(s.health + 1) }), effect: 'pet' };
  }
  if (action === 'clean') {
    const bath = bathOf(ctx.sp);
    return { n: Object.assign(n, { clean: 100, poops: [], fun: clamp(s.fun + (bath > 0 ? 10 : bath < 0 ? -8 : -3)) }), effect: 'clean' };
  }
  if (action === 'medicine') {
    if (!s.sick) return { n: null, say: 'no' };
    return { n: Object.assign(n, { sick: false, health: clamp(s.health + 20) }), effect: 'medicine' };
  }
  if (action === 'sleep') {
    // not sleepy yet: it won't go to bed
    if (!s.napping && s.energy > 70) return { n: null, say: 'no' };
    return { n: Object.assign(n, { napping: !s.napping, wokeAt: s.napping ? ctx.now : 0 }) };
  }
  if (action === 'poop') {
    // one dropping clicked away
    return { n: Object.assign(n, { poops: s.poops.slice(1), clean: clamp(s.clean + 10) }) };
  }
  return { n: null };
}
