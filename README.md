# smart-shell

A dock for Wayland desktops: workspaces, apps
and live status widgets in one glass bar, with themes, particle effects and
little pets that react to CPU load.

The goal is a [Quickshell](https://quickshell.outfoxxed.me/) (QML) shell that
runs as a layer-shell surface on Hyprland. While the design settles, it lives
as an HTML prototype that mirrors the same component structure.

## Repository layout

```
prototype/   HTML/JS design lab (vanilla Web Components, no build step)
shell/       the real Quickshell config (QML) - not started yet
docs/        architecture and design notes
tools/       helper scripts (icon vendoring, ...)
```

## Running the prototype

```sh
prototype/serve.sh            # http://localhost:4321
WALLPAPER=~/Videos/bg.mp4 prototype/serve.sh   # optional animated wallpaper
```

ES modules don't load from `file://`, hence the tiny Python server. The page
uses a static wallpaper; a local video can be linked into the untracked
`prototype/assets/local/` for the dev panel's "animated wallpaper" option.

## Making it yours

- `prototype/src/data/config.js` - which widgets the dock shows, their order and
  grouping, and the items of the quick tile.
- `prototype/src/data/snapshot.js` - the machine data the prototype displays
  (the real shell reads it live).
- Missing backends (no Docker, no hyprsunset, no Bluetooth adapter...) keep
  their feature visible but disabled, telling what to install.

See [docs/architecture.md](docs/architecture.md) for how the pieces fit.

## Icons

- UI icons: [Lucide](https://lucide.dev) (ISC), vendored with `tools/lucide.sh add <name>`.
- App icons in the prototype: [Papirus](https://github.com/PapirusDevelopmentTeam/papirus-icon-theme) (GPL-3.0).
