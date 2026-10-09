// Theme registry. Colours live in src/styles/themes/<id>.css; `fx` picks the
// particle effect drawn over the wallpaper (see components/fx/effects).
// Display names are translated under `themes.<id>`.
export const themes = [
  { id: 'glass', swatch: '#3a3a40', fx: null },
  { id: 'midnight', swatch: '#1e2150', fx: null },
  { id: 'aqua', swatch: '#bfe9ff', fx: null },
  { id: 'neon', swatch: '#ff3bd4', fx: null },
  { id: 'paper', swatch: '#f6f1e6', fx: null },
  { id: 'canarinho', swatch: '#009c3b', fx: null },
  { id: 'snowy', swatch: '#0e2a5c', fx: 'snow' },
  { id: 'halloween', swatch: '#ff8c1a', fx: 'bats' },
];
