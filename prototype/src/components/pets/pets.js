import { Component, define } from '../../core/component.js';
import { onFrame } from '../../core/loop.js';
import { store } from '../../state.js';
import { createPet } from './engine.js';
import { species } from './species/index.js';
import { config } from '../../data/config.js';
import { memStatus, tempStatus } from '../control-center/panes/system.js';
import { openPopover, closePopover, isOpen } from '../../core/popover.js';
import { setHTML } from '../ui/ui.js';
import { tick, care, menuHTML, urgent, foodOf, tooTired, SIGN } from './tama.js';

// pets dance while the player in config.pets.danceWith (YouTube Music) plays;
// the mock's media slice stands in for MPRIS (its `url`, `source`)
const dancing = media => media.playing
  && (config.pets?.danceWith ?? []).some(w => `${media.url ?? ''} ${media.source ?? ''}`.toLowerCase().includes(w.toLowerCase()));

// Every sprite faces right in a 46x36 box with its feet on y=33.
export { species };

// The pet walking on top of the dock (one per dock, ui.pet). Must sit inside
// .dock-wrap, which is its floor.
class Pets extends Component {
  static slices = ['ui', 'tama'];

  setup() {
    this.pets = [];
    // the pet's droppings, on the dock's floor (Tamagotchi mode); a click cleans one
    this.poops = document.createElement('div');
    this.poops.className = 'tama-poops';
    this.parentElement.append(this.poops);
    this.poops.addEventListener('click', e => {
      if (e.target.closest('[data-poop]') && this.pets[0]) care('poop', this.pets[0].kind);
    });
    // how into the music they are (0..1). A song starts: they look around
    // for ~1.4 s, then ease in over ~2 s; it stops: they keep going ~1.2 s,
    // then wind down in ~1 s (the mock has no cava, so it holds at 0.6). It
    // sets the dance's tempo (--slow) and how far they stroll
    let groove = 0, clock = 0, heard = false, changedAt = -10, tamaIn = 0;
    this.stopLoop = onFrame(dt => {
      const { system, agenda, ui, tama } = store.get();
      // what the user is busy with right now: a work meeting wins over music
      const work = agenda.ongoing?.category === 'work';
      clock += dt;
      // in care mode a tired (or sleeping) pet hears the music but doesn't dance
      const music = dancing(store.get().media);
      const hears = music && !(ui.tamaOn && tooTired(tama));
      if (hears !== heard) { heard = hears; changedAt = clock; }
      const listening = hears && clock - changedAt < 1.4;
      if (hears || clock - changedAt >= 1.2) {
        const want = hears && !listening ? .6 : 0;
        groove += (want - groove) * (1 - Math.exp(-dt / (want > groove ? .7 : .35)));
      }
      this.parentElement?.style.setProperty('--slow', (1.02 / (.3 + 1.2 * groove)).toFixed(2));
      const activity = work ? 'work' : listening ? 'listen' : groove > .04 ? 'dance' : null;
      // config.thresholds: CPU drives what it does; low free RAM makes it
      // heavy, heat turns it reddish (1 = warn, 2 = crit)
      const level = st => (st === 'crit' ? 2 : st === 'warn' ? 1 : 0);
      const opts = { cpu: config.thresholds.cpu, heavy: level(memStatus(system)), hot: level(tempStatus(system)), groove,
        hold: ui.popover === 'tama' };
      // Tamagotchi mode: put to bed, it sleeps whatever the CPU does; its
      // needs run down once a second
      const napping = ui.tamaOn && tama.napping;
      for (const pet of this.pets) pet.step(dt, napping ? 0 : system.load, activity, opts);
      if (ui.tamaOn && this.pets.length && (tamaIn -= dt) <= 0) {
        tamaIn = 1;
        tick(1, { kind: ui.pet, asleep: napping || system.load < config.thresholds.cpu.sleep, hot: opts.hot === 2 || opts.heavy === 2,
          load: system.load, music, dancing: activity === 'dance', meeting: work });
      }
    });
  }

  teardown() {
    this.stopLoop();
    this.poops.remove();
  }

  update({ ui, tama }) {
    const wanted = species[ui.pet] ? [ui.pet] : [];
    this.pets = this.pets.filter(p => wanted.includes(p.kind) || (p.remove(), false));
    for (const kind of wanted) {
      if (!this.pets.some(p => p.kind === kind)) this.pets.push(this.adopt(createPet(kind, species[kind], this.parentElement)));
    }
    // Tamagotchi mode: its menu, the sign of its most urgent need, sick or
    // baby looks, and its droppings on the dock
    for (const pet of this.pets) {
      const { el } = pet;
      pet.setFlags([ui.tamaOn && 'tama', ui.tamaOn && tama.sick && 'sick'].filter(Boolean).join(' '));
      el.toggleAttribute('data-open', ui.tamaOn && ui.popover === 'tama');
      const need = ui.tamaOn ? urgent(tama) : '';
      el.querySelector('.need').textContent = need === 'food' ? foodOf(pet.kind) : SIGN[need] ?? '';
      if (ui.tamaOn && ui.popover === 'tama') setHTML(el.querySelector('.menu'), menuHTML(pet.kind, tama));
    }
    const poops = ui.tamaOn && this.pets.length ? tama.poops : [];
    setHTML(this.poops, poops.map(x => `<button class="poop" style="left:${(x * 100).toFixed(1)}%" data-poop>💩</button>`).join(''));
  }

  // wire a new pet up for Tamagotchi mode: a click (or right click) on it
  // opens its care menu, another closes it
  adopt(pet) {
    const { el } = pet;
    el.dataset.popover = 'tama';
    el.insertAdjacentHTML('beforeend', '<span class="need"></span><div class="menu tama-menu"></div>');
    const toggle = e => {
      if (!store.get().ui.tamaOn || e.target.closest('.menu')) return;
      e.preventDefault();
      // beside the pet: to its left, or to its right near the screen's left edge
      // (an attribute: the engine rewrites the pet's classes)
      el.dataset.side = el.getBoundingClientRect().left < 230 + 24 + 12 ? 'right' : 'left';
      isOpen('tama') ? closePopover() : openPopover('tama');
    };
    el.addEventListener('click', toggle);
    el.addEventListener('contextmenu', toggle);
    el.querySelector('.menu').addEventListener('click', e => {
      e.stopPropagation();   // not a click on the pet (heart, word)
      const action = e.target.closest('[data-care]')?.dataset.care;
      if (action) this.react(pet, care(action, pet.kind));
    });
    return pet;
  }

  // what the pet does about a care action: a word, and its care animation
  react(pet, { say, effect } = {}) {
    if (say) pet.speak(say);
    if (!effect) return;
    if (effect === 'pet') pet.love();   // a heart and its word
    pet.perform(effect, foodOf(pet.kind));
  }
}

define('ss-pets', Pets);
