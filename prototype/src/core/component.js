import { store } from '../state.js';

// Base class for every widget.
//
// Components render into the light DOM so the theme's CSS custom properties and
// shared classes reach them. Lifecycle:
//   render()   -> static markup, called once
//   setup()    -> wire events, called once after render
//   update(s)  -> sync the DOM with state, called on every change of `slices`
export class Component extends HTMLElement {
  // Slices that trigger update(); null means "every change".
  static slices = null;

  connectedCallback() {
    if (this.mounted) return;
    this.mounted = true;
    const markup = this.render?.();
    if (markup !== undefined) this.innerHTML = markup;
    this.setup?.();
    this.update?.(store.get());
    const slices = this.constructor.slices;
    this.unsubscribe = store.subscribe((state, slice) => {
      if (!slices || slices.includes(slice)) this.update?.(state);
    });
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.teardown?.();
    this.mounted = false;
  }

  $(selector) {
    return this.querySelector(selector);
  }
}

export function define(tag, cls) {
  if (!customElements.get(tag)) customElements.define(tag, cls);
}
