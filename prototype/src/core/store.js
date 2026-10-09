// A tiny observable store. State is split into named slices; components
// subscribe to the slices they read and re-render when one of them changes.
export function createStore(initial) {
  let state = initial;
  const listeners = new Set();

  return {
    get: () => state,

    // Shallow-merge a patch into one slice. `patch` may be a function of the slice.
    update(slice, patch) {
      const current = state[slice];
      const next = typeof patch === 'function' ? patch(current) : patch;
      state = { ...state, [slice]: { ...current, ...next } };
      for (const fn of listeners) fn(state, slice);
    },

    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
