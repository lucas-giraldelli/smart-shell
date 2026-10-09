# Architecture

The prototype and the future Quickshell shell share one mental model, so a
component designed in HTML maps 1:1 to a QML component later.

```
config  ──►  dock (layout)  ──►  widgets  ◄──  store (state slices)  ◄──  services
                                    │                                       ▲
                                    └──── actions (update / service calls) ─┘
```

## Pieces

| Piece | Prototype | Quickshell |
|---|---|---|
| **Config** - what is shown, in which order | `src/data/config.js` | `~/.config/smart-shell/config.json` |
| **Capabilities** - which optional backends exist | `src/data/capabilities.js` + `caps` slice | probed at startup (`command -v`, D-Bus) |
| **Store** - app state in named slices | `src/core/store.js`, `src/state.js` | singleton QML objects with properties |
| **Services** - feed slices, perform actions | `src/services/*` (simulated) | `Quickshell.Services.*`, `Process`, sockets |
| **Widgets** - one folder each | `src/components/<name>/` (Web Component + CSS) | `shell/components/<Name>.qml` |
| **Panes** - quick item + control-center tab | `src/components/control-center/panes/*` | `shell/components/panes/*.qml` |
| **Themes** - design tokens | `src/styles/themes/<id>.css` | `shell/themes/<Id>.qml` |
| **Translations** - every UI string | `src/i18n/locales/<tag>.js` via `t('area.key')` | Qt `qsTr` / the same keys |

## Rules of thumb

- **Widgets never own data.** They read slices and call actions; anything that
  touches the system goes through a service.
- **One feature, one place.** A quick-tile feature is a single pane file: its
  mini item, its tab, its scroll behaviour and the capability it needs.
- **Missing backend = disabled, not hidden.** Users see the feature exists and
  what to install.
- **Machine data stays in `snapshot.js`.** Everything else is generic.
- **No UI text in components.** Strings live in `src/i18n/locales`; data
  (holidays, weather codes, reasons from tools) carries keys or codes, never prose.
- **Themes only touch tokens** (plus decorative pseudo-elements). Components
  read `var(--…)` and never branch on the theme name.

## Prototype component contract

`src/core/component.js` - light-DOM custom elements:

```js
class Clock extends Component {
  static slices = [];         // slices that trigger update(); null = all
  render() {}                 // static markup, once
  setup() {}                  // events, once
  update(state) {}            // sync DOM with state
  teardown() {}               // timers, listeners
}
define('ss-clock', Clock);
```

Adding a widget: create `src/components/<name>/{name.js,name.css}`, import it in
`components/index.js` and `styles/index.css`, register it in
`components/registry.js`, then list its id in `data/config.js`.

## Targets

Quickshell needs a compositor with `wlr-layer-shell` (Hyprland, Sway, niri,
river, KWin...; not GNOME). Workspaces/windows come from Hyprland IPC first;
other compositors would plug in as alternative workspace services.
