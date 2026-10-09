import { store, update } from '../state.js';

// Only one popover is open at a time; its name lives in `ui.popover`.
// Elements that own a popover carry data-popover="<name>", and clicks outside
// the open one (or Esc) close it.
export const openPopover = (name, extra = {}) => update('ui', { popover: name, ...extra });
export const closePopover = () => update('ui', { popover: null });
export const isOpen = name => store.get().ui.popover === name;

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
