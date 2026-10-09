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
# calendar events exported by tools/thunderbird-events.py (systemd timer)
ln -sf "${XDG_CACHE_HOME:-$HOME/.cache}/smart-shell/events.json" "$LOCAL/events.json"

echo "smart-shell prototype: http://localhost:$PORT"
# no-store: browsers otherwise cache the ES modules and keep running old code
exec python3 -c '
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class NoCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

ThreadingHTTPServer(("127.0.0.1", int(sys.argv[1])), partial(NoCache, directory=".")).serve_forever()
' "$PORT"
