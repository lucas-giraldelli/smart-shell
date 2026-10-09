// Lucide icons, inlined so they inherit `currentColor` from the theme.
// The SVG files live in assets/icons/lucide (managed by tools/lucide.sh).
const BASE = 'assets/icons/lucide/';
const paths = new Map();

export async function loadIcons() {
  const names = await (await fetch(BASE + 'manifest.json')).json();
  await Promise.all(names.map(async name => {
    const svg = await (await fetch(`${BASE}${name}.svg`)).text();
    // keep only the drawing elements; the wrapper is rebuilt by icon()
    paths.set(name, svg.slice(svg.indexOf('>', svg.indexOf('<svg')) + 1, svg.lastIndexOf('</svg>')).trim());
  }));
}

export function icon(name, className = '') {
  if (!paths.has(name)) console.warn(`[icons] unknown icon "${name}" - run tools/lucide.sh add ${name}`);
  return `<svg class="i ${className}" viewBox="0 0 24 24">${paths.get(name) ?? ''}</svg>`;
}

export const appIcon = name => `assets/icons/apps/${name}.svg`;
