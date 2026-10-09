#!/usr/bin/env bash
# Serve the prototype on http://localhost:$PORT (ES modules don't load from file://).
#
# The page ships with a static wallpaper. Optionally link a local video
# (WALLPAPER, default ~/wallpapers/live.mp4) to try the "animated wallpaper"
# option of the dev panel; it stays untracked in assets/local/.
set -euo pipefail
cd "$(dirname "$0")"

PORT="${PORT:-4321}"
WALLPAPER="${WALLPAPER:-$HOME/wallpapers/live.mp4}"
LOCAL=assets/local
mkdir -p "$LOCAL"

[ -f "$WALLPAPER" ] && ln -sf "$WALLPAPER" "$LOCAL/wallpaper.mp4"

echo "smart-shell prototype: http://localhost:$PORT"
exec python3 -m http.server "$PORT" --bind 127.0.0.1
