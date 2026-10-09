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

const EDGE = 12;  // keep popovers this far from the screen edges
const ARROW = 18; // the arrow never gets closer than this to a popover corner

// Open the popover to the right of its tile (left edges aligned), sliding it
// back on screen if needed, and point its speech-bubble arrow at the tile's
// centre. Popovers are the `.menu` child of the element with data-popover.
function place(name) {
  const owner = document.querySelector(`[data-popover="${name}"]`);
  const menu = owner?.querySelector(':scope > .menu');
  if (!menu) return;
  const tile = owner.getBoundingClientRect();
  const width = menu.offsetWidth;
  let left = 0;
  left = Math.min(left, innerWidth - EDGE - tile.left - width);
  left = Math.max(left, EDGE - tile.left);
  const arrow = Math.min(Math.max(tile.width / 2 - left, ARROW), width - ARROW);
  menu.style.setProperty('--menu-left', `${left}px`);
  menu.style.setProperty('--arrow-x', `${arrow}px`);
}

export function startPopovers() {
  // place after the owner has rendered the popover's content
  const placeOpen = () => {
    const name = store.get().ui.popover;
    if (name) requestAnimationFrame(() => place(name));
  };
  store.subscribe((_, slice) => { if (slice === 'ui') placeOpen(); });
  addEventListener('resize', placeOpen);

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
