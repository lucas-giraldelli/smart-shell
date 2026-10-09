# shell (Quickshell)

The real dock, written in QML for [Quickshell](https://quickshell.outfoxxed.me/)
(0.3.x, Qt 6). It ports `../prototype`, which stays the visual spec: every
component's header comment names its prototype counterpart. Install and
per-widget requirements are in the [root README](../README.md#install).

```
shell.qml        entry: one PanelWindow (layer-shell, namespace "smart-shell")
                 per screen, input-masked to the dock
Theme.qml        design tokens: the prototype's eight themes
Ui.qml           dock settings (saved to the state file) + which popover is open,
                 with an IpcHandler: `qs ipc ... call popover open <name> <tab>`
Config.qml       ~/.config/smart-shell/config.json merged over the defaults
I18n.qml         translations (lib/locales link to the prototype's) and date formats
Panes.qml        the quick tile / control-center panes
Pets.qml         pet species (lib/pets link to the prototype's sprites)
components/      Dock and its widgets (Workspaces, CapsLock, AppRow, Music, Tray,
                 BluetoothTile, Quick, Weather, Clock), Pet, DockDecor and
                 DockEffects (theme decorations / particles), popovers (Popover,
                 ControlCenter + panes/, Forecast, Calendar, TrayMenu), Tip,
                 Label (fractional font sizes), Icon (Lucide) and ui/ (the kit)
services/        data singletons: Audio (PipeWire), Brightness (ddcutil), Caps,
                 Docker, Network, SystemStats, Processes, Media (MPRIS), Weather,
                 Events, Keyboard, Apps, TrayBadges
lib/             pure JS shared with / ported from the prototype (rules.mjs,
                 calendar.mjs, pets.mjs, fx.mjs, locales, themes, pet sprites)
shaders/         tray icon tint (source + compiled .qsb)
assets/          -> ../prototype/assets (Lucide icons)
```

Known differences from the prototype: the pets' tails don't wag (the sprite
is an image per pose, not animated SVG parts), canarinho's diagonal dock
gradient runs left to right, and per-theme blur (aqua / paper have none in
the prototype) isn't possible with one Hyprland layer rule.
