import { store, update } from '../state.js';
import { themes } from '../data/themes.js';

// Applies ui.theme to <body data-theme>. `?theme=<id>` in the URL overrides it,
// which is handy for screenshots.
export function startTheme() {
  const fromUrl = new URLSearchParams(location.search).get('theme');
  if (themes.some(t => t.id === fromUrl)) update('ui', { theme: fromUrl });
  if (!themes.some(t => t.id === store.get().ui.theme)) update('ui', { theme: themes[0].id });

  const apply = () => { document.body.dataset.theme = store.get().ui.theme; };
  apply();
  store.subscribe((_, slice) => { if (slice === 'ui') apply(); });
}
