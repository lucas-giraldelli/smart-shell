#!/usr/bin/env bash
# Serve the prototype on http://localhost:$PORT (ES modules don't load from file://).
#
# The wallpaper is a local, untracked file: point WALLPAPER at a video or image
# (default: ~/wallpapers/live.mp4). Without one the page uses a plain gradient.
set -euo pipefail
cd "$(dirname "$0")"

PORT="${PORT:-4321}"
WALLPAPER="${WALLPAPER:-$HOME/wallpapers/live.mp4}"
LOCAL=assets/local
mkdir -p "$LOCAL"

if [ -f "$WALLPAPER" ]; then
  case "$WALLPAPER" in
    *.mp4|*.webm|*.mkv)
      ln -sf "$WALLPAPER" "$LOCAL/wallpaper.mp4"
      # poster frame shown while the video loads
      if [ ! -f "$LOCAL/wallpaper.jpg" ] && command -v ffmpeg >/dev/null; then
        ffmpeg -loglevel error -y -ss 3 -i "$WALLPAPER" -frames:v 1 -vf scale=1920:-1 -q:v 3 "$LOCAL/wallpaper.jpg"
      fi ;;
    *) ln -sf "$WALLPAPER" "$LOCAL/wallpaper.jpg" ;;
  esac
fi

echo "smart-shell prototype: http://localhost:$PORT"
exec python3 -m http.server "$PORT" --bind 127.0.0.1
