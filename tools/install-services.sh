#!/usr/bin/env bash
# Install smart-shell's systemd user units and start their timers.
# Units are generated from systemd/*.{service,timer} with the repo path filled in;
# re-run after moving the repo. Remove with: tools/install-services.sh --uninstall
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
UNITS=(smart-shell-events)

if [ "${1:-}" = "--uninstall" ]; then
  for u in "${UNITS[@]}"; do
    systemctl --user disable --now "$u.timer" 2>/dev/null || true
    rm -f "$DEST/$u.service" "$DEST/$u.timer"
  done
  systemctl --user daemon-reload
  echo "removed: ${UNITS[*]}"
  exit 0
fi

mkdir -p "$DEST"
for u in "${UNITS[@]}"; do
  for kind in service timer; do
    sed "s#@REPO@#$REPO#g" "$REPO/systemd/$u.$kind" > "$DEST/$u.$kind"
  done
done
systemctl --user daemon-reload
for u in "${UNITS[@]}"; do
  systemctl --user enable --now "$u.timer"
  systemctl --user start "$u.service"   # first run right away
done
echo "installed: ${UNITS[*]}"
