// Theme registry. Colours live in src/styles/themes/<id>.css; `fx` picks the
// particle effect drawn over the wallpaper (see components/fx/effects).
export const themes = [
  { id: 'glass', name: 'Vidro', swatch: '#3a3a40', fx: null },
  { id: 'midnight', name: 'Midnight', swatch: '#1e2150', fx: null },
  { id: 'aqua', name: 'Aqua Shelf', swatch: '#bfe9ff', fx: null },
  { id: 'neon', name: 'Neon', swatch: '#ff3bd4', fx: null },
  { id: 'paper', name: 'Papel', swatch: '#f6f1e6', fx: null },
  { id: 'canarinho', name: 'Canarinho', swatch: '#009c3b', fx: null },
  { id: 'snowy', name: 'Snowy Night', swatch: '#0e2a5c', fx: 'snow' },
  { id: 'halloween', name: 'Halloween', swatch: '#ff8c1a', fx: 'bats' },
];
