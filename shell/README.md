# shell (Quickshell)

The real dock, written in QML for [Quickshell](https://quickshell.outfoxxed.me/).
Not started yet - the design is being settled in `../prototype`.

Planned layout, mirroring the prototype (see `../docs/architecture.md`):

```
shell.qml               entry: one PanelWindow (layer-shell) per screen
components/             Dock, Workspaces, AppRow, Music, Weather, System,
                        Bluetooth, Quick, ControlCenter (+ panes/), Tray, Clock, Pets
services/               Hyprland, Audio (PipeWire), Bluetooth (BlueZ), Brightness (ddcutil),
                        Network, Docker, System (/proc), Media (MPRIS), Capabilities
themes/                 one file per theme (design tokens)
config/                 default config + loader for ~/.config/smart-shell/config.json
```
