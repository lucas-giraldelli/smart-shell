// Every pet species, in the pet picker's order. One file per species (its
// drawing, actions, poses, care animations, food and pace: README "Adding a
// pet"); to add one, import it here and give it a name in the locales.
// Shared by the prototype and the shell (lib/pets links to this folder; the
// shell enters through index.mjs, which links here).
import cat from './cat.js';
import shiba from './shiba.js';
import fox from './fox.js';
import penguin from './penguin.js';
import bunny from './bunny.js';
import capy from './capy.js';
import frog from './frog.js';
import duck from './duck.js';
import corgi from './corgi.js';
import panda from './panda.js';
import owl from './owl.js';
import turtle from './turtle.js';
import octopus from './octopus.js';
import macaw from './macaw.js';
import anteater from './anteater.js';
import ghost from './ghost.js';
import blackcat from './blackcat.js';
import pig from './pig.js';

export const species = {
  cat, shiba, fox, penguin, bunny, capy, frog, duck, corgi, panda, owl, turtle, octopus, macaw, anteater, ghost, blackcat, pig,
};
