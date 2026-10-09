import { Component, define } from '../../core/component.js';
import { onFrame } from '../../core/loop.js';
import { store } from '../../state.js';
import { createPet } from './engine.js';
import { config } from '../../data/config.js';
import { memStatus, tempStatus } from '../control-center/panes/system.js';

// pets dance while the player in config.pets.danceWith (YouTube Music) plays;
// the mock's media slice stands in for MPRIS (its `url`, `source`)
const dancing = media => media.playing
  && (config.pets?.danceWith ?? []).some(w => `${media.url ?? ''} ${media.source ?? ''}`.toLowerCase().includes(w.toLowerCase()));
import cat from './species/cat.js';
import shiba from './species/shiba.js';
import fox from './species/fox.js';
import penguin from './species/penguin.js';
import bunny from './species/bunny.js';
import capy from './species/capy.js';
import frog from './species/frog.js';

// Every sprite faces right in a 46x36 box with its feet on y=33.
export const species = { cat, shiba, fox, penguin, bunny, capy, frog };

// The pet walking on top of the dock (one per dock, ui.pet). Must sit inside
// .dock-wrap, which is its floor.
class Pets extends Component {
  static slices = ['ui'];

  setup() {
    this.pets = [];
    this.stopLoop = onFrame(dt => {
      const { system, agenda } = store.get();
      // what the user is busy with right now: a work meeting wins over music
      const work = agenda.ongoing?.category === 'work';
      const activity = work ? 'work' : dancing(store.get().media) ? 'dance' : null;
      // config.thresholds: CPU drives what it does; low free RAM makes it
      // heavy, heat turns it reddish (1 = warn, 2 = crit)
      const level = st => (st === 'crit' ? 2 : st === 'warn' ? 1 : 0);
      const opts = { cpu: config.thresholds.cpu, heavy: level(memStatus(system)), hot: level(tempStatus(system)) };
      for (const pet of this.pets) pet.step(dt, system.load, activity, opts);
    });
  }

  teardown() {
    this.stopLoop();
  }

  update({ ui }) {
    const wanted = species[ui.pet] ? [ui.pet] : [];
    this.pets = this.pets.filter(p => wanted.includes(p.kind) || (p.remove(), false));
    for (const kind of wanted) {
      if (!this.pets.some(p => p.kind === kind)) this.pets.push(createPet(kind, species[kind], this.parentElement));
    }
  }
}

define('ss-pets', Pets);
