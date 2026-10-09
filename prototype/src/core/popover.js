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
  shape(menu, arrow);
  // the content can change size while open (the calendar's day list...)
  menu.resizer ??= new ResizeObserver(() => shape(menu, parseFloat(menu.style.getPropertyValue('--arrow-x')) || 24));
  menu.resizer.observe(menu);
}

// The bubble's outline: a rounded rect with the tail cut into its bottom
// edge, as one path (border-box coordinates; the tail is 10px tall). `ring`
// is the 1px border: the outline minus the same shape 1px inside.
function outline(w, h, r, ax, tail, inset = 0) {
  const i = inset, R = r - i, b = h - i, t = tail - i * 1.4142;
  return `M ${r} ${i} H ${w - r} A ${R} ${R} 0 0 1 ${w - i} ${r} V ${b - R} A ${R} ${R} 0 0 1 ${w - r} ${b}`
    + ` H ${ax + t} L ${ax} ${b + t} L ${ax - t} ${b} H ${r} A ${R} ${R} 0 0 1 ${i} ${b - R} V ${r} A ${R} ${R} 0 0 1 ${r} ${i} Z`;
}
function shape(menu, arrow) {
  const w = menu.offsetWidth, h = menu.offsetHeight, r = 14, ax = arrow + 1;
  const outer = outline(w, h, r, ax, 10), inner = outline(w, h, r, ax, 10, 1);
  menu.style.setProperty('--bubble-fill', `path("${outer}")`);
  menu.style.setProperty('--bubble-ring', `path(evenodd, "${outer} ${inner}")`);
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
