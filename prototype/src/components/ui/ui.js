import { icon } from '../../core/icons.js';

// Markup helpers for the shared UI kit (see ui.css). They return HTML strings;
// interactive parts carry data attributes so the owner can delegate events.

export const row = ({ icon: name, title, meta = '', trailing = '', attrs = '', active = false }) => `
  <div class="row${active ? ' active' : ''}" ${attrs}>
    ${name ? icon(name) : ''}
    <span class="grow">${title}${meta ? `<div class="meta">${meta}</div>` : ''}</span>
    ${trailing}
  </div>`;

export const toggle = on => `<span class="switch${on ? ' on' : ''}"></span>`;
export const radio = () => '<span class="radio"></span>';

// A slider whose live parts are found by `key`: [data-value=key], [data-range=key].
export const slider = ({ key, label, iconName, button = false, min = 0, max = 100, step = 1, warm = false }) => `
  <div class="slide">
    ${button ? `<button class="ib" data-btn="${key}">${icon(iconName)}</button>` : `<span class="ib">${icon(iconName)}</span>`}
    <div class="body">
      <div class="top"><span data-label="${key}">${label}</span><b data-value="${key}"></b></div>
      <input class="rng${warm ? ' warm' : ''}" data-range="${key}" type="range" min="${min}" max="${max}" step="${step}">
    </div>
  </div>`;

// Sync a slider without fighting the user's drag.
export function setSlider(root, key, value, text) {
  const range = root.querySelector(`[data-range="${key}"]`);
  if (document.activeElement !== range) range.value = value;
  range.style.setProperty('--p', ((value - range.min) / (range.max - range.min) * 100).toFixed(1) + '%');
  root.querySelector(`[data-value="${key}"]`).textContent = text;
}

// Replace an element's markup only when it changed. Compares against the last
// string we set (the browser normalises innerHTML, so reading it back never matches).
export function setHTML(el, html) {
  if (el.lastHTML === html) return;
  el.lastHTML = html;
  el.innerHTML = html;
}
