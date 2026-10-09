# shell (Quickshell)

The real dock, written in QML for [Quickshell](https://quickshell.outfoxxed.me/)
(0.3.x, Qt 6). It ports `../prototype`, which stays the visual spec: every
component's header comment names its prototype counterpart. Install and
per-widget requirements are in the [root README](../README.md#install).

```
shell.qml        entry: one PanelWindow (layer-shell, namespace "smart-shell")
                 per screen, input-masked to the dock
Theme.qml        design tokens (the prototype's glass theme)
Ui.qml           dock settings (saved to the state file) + which popover is open,
                 with an IpcHandler: `qs ipc ... call popover open <name> <tab>`
Config.qml       ~/.config/smart-shell/config.json merged over the defaults
I18n.qml         translations (lib/locales link to the prototype's) and date formats
Panes.qml        the quick tile / control-center panes
Pets.qml         pet sprites (lib/pets link to the prototype's)
components/      Dock and its widgets (Workspaces, CapsLock, AppRow, Music, Tray,
                 BluetoothTile, Quick, Weather, Clock), popovers (Popover,
                 ControlCenter + panes/, Forecast, Calendar, TrayMenu), Tip,
                 Label (fractional font sizes), Icon (Lucide) and ui/ (the kit)
services/        data singletons: Audio (PipeWire), Brightness (ddcutil), Caps,
                 Docker, Network, SystemStats, Processes, Media (MPRIS), Weather,
                 Events, Keyboard, Apps
lib/             pure JS shared with / ported from the prototype (rules.mjs,
                 calendar.mjs, locales, themes, pets)
shaders/         tray icon tint (source + compiled .qsb)
assets/          -> ../prototype/assets (Lucide icons)
```

Not ported yet: themes other than glass (the picker is shown but only glass
is styled), the pets and the per-theme effects (snow, bats).
