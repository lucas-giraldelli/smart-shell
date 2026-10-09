import { store, update } from '../state.js';

// Only one popover is open at a time; its name lives in `ui.popover`.
// Elements that own a popover carry data-popover="<name>", and clicks outside
// the open one (or Esc) close it.
export const openPopover = (name, extra = {}) => update('ui', { popover: name, ...extra });
export const closePopover = () => update('ui', { popover: null });
export const isOpen = name => store.get().ui.popover === name;

// Did the event come from inside an element matching `selector`? Uses the path
// fixed at dispatch, so it still works after a handler re-rendered the target.
export const cameFrom = (e, selector) => e.composedPath().some(el => el.matches?.(selector));
// The element matching `selector` the event passed through, if any.
export const pathFind = (e, selector) => e.composedPath().find(el => el.matches?.(selector));

export function startPopovers() {
  document.addEventListener('click', e => {
    const name = store.get().ui.popover;
    // composedPath() is fixed when the click is dispatched, so it still holds the
    // popover even if the click handler re-rendered (and detached) the target
    if (name && !e.composedPath().some(el => el.dataset?.popover === name)) closePopover();
  });
  addEventListener('keydown', e => {
    if (e.key === 'Escape') closePopover();
  });
}
