// A newborn pet's needs in Tamagotchi mode (tama.js), kept free of imports so
// state.js can start from it without a cycle.
export const fresh = () => ({
  food: 80, fun: 80, clean: 100, energy: 90, health: 100,
  sick: false, poops: [], nextPoop: 3, napping: false, mistakes: 0, bornAt: Date.now(),
});
