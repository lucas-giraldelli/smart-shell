import { Component, define } from '../../core/component.js';
import { onFrame } from '../../core/loop.js';
import { store } from '../../state.js';
import { createPet } from './engine.js';
import cat from './species/cat.js';
import shiba from './species/shiba.js';
import fox from './species/fox.js';
import penguin from './species/penguin.js';
import bunny from './species/bunny.js';
import capy from './species/capy.js';

// Every sprite faces right in a 46x36 box with its feet on y=33.
export const species = { cat, shiba, fox, penguin, bunny, capy };

// Pets walking on top of the dock. Must sit inside .dock-wrap, which is their floor.
class Pets extends Component {
  static slices = ['ui'];

  setup() {
    this.pets = [];
    this.stopLoop = onFrame(dt => {
      const load = store.get().system.load;
      for (const pet of this.pets) pet.step(dt, load);
    });
  }

  teardown() {
    this.stopLoop();
  }

  update({ ui }) {
    const wanted = ui.pets.filter(kind => species[kind]);
    this.pets = this.pets.filter(p => wanted.includes(p.kind) || (p.remove(), false));
    for (const kind of wanted) {
      if (!this.pets.some(p => p.kind === kind)) this.pets.push(createPet(kind, species[kind], this.parentElement));
    }
  }
}

define('ss-pets', Pets);
