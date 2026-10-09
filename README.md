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
systemd/     user units for background jobs (installed by tools/install-services.sh)
tools/       helper scripts (icons, calendar export, service install)
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

- `~/.config/smart-shell/config.json` - your settings; any top-level key replaces
  the default in `prototype/src/data/config.js`. Start from
  [`config/config.example.json`](config/config.example.json):
  - `dock` / `quick` - which widgets show, their order and grouping: `dock` is a
    list of groups (a separator goes between them), each listing widget ids from
    `prototype/src/components/registry.js`; `quick` orders the quick-tile items
  - `holidays` - holiday regions on the calendar (`br`, `cba`, `us`)
  - `events.calendars` - Thunderbird calendars to read (by name, usually the
    account's e-mail); `daysBack` / `daysAhead` - the window exported
- `prototype/src/data/snapshot.js` - the machine data the prototype displays
  (the real shell reads it live).
- Missing backends (no Docker, no hyprsunset, no Bluetooth adapter...) keep
  their feature visible but disabled, telling what to install.

See [docs/architecture.md](docs/architecture.md) for how the pieces fit.

## Calendar events

`tools/thunderbird-events.py` exports the events of your Thunderbird calendars
to `~/.cache/smart-shell/events.json`: recurring events expanded, moved and
cancelled occurrences applied, declined invites dropped and duplicates (the same
invite in several calendars) merged. A systemd user timer refreshes it every 5
minutes:

```sh
tools/install-services.sh              # install + start the timer
tools/install-services.sh --uninstall
tools/thunderbird-events.py --output - # run once, print to stdout
```

Pick the calendars in `events.calendars` of the config. Thunderbird only keeps a
local copy of calendars with **Offline support** enabled (calendar properties);
a chosen calendar that can't be read is listed in the calendar popover with why.

## Icons

- UI icons: [Lucide](https://lucide.dev) (ISC), vendored with `tools/lucide.sh add <name>`.
- App icons in the prototype: [Papirus](https://github.com/PapirusDevelopmentTeam/papirus-icon-theme) (GPL-3.0).
