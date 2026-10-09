#!/usr/bin/env bash
# Manage the Lucide icons vendored into the prototype.
#
#   tools/lucide.sh add bell wifi   # download icons and refresh the manifest
#   tools/lucide.sh manifest        # only rebuild manifest.json
#
# Icons are pinned to one lucide-static release so every icon shares the same style.
set -euo pipefail

VERSION="1.47.0"
DIR="$(cd "$(dirname "$0")/.." && pwd)/prototype/assets/icons/lucide"

manifest() {
  find "$DIR" -maxdepth 1 -name '*.svg' -printf '%f\n' | sed 's/\.svg$//' | sort |
    python3 -c 'import json, sys; print(json.dumps([l.strip() for l in sys.stdin], indent=2))' \
    > "$DIR/manifest.json"
}

case "${1:-}" in
  add)
    shift
    [ $# -gt 0 ] || { echo "usage: $0 add <icon>..." >&2; exit 1; }
    for name in "$@"; do
      curl -fsSL "https://unpkg.com/lucide-static@$VERSION/icons/$name.svg" -o "$DIR/$name.svg"
      echo "added $name"
    done
    manifest
    ;;
  manifest) manifest ;;
  *) echo "usage: $0 add <icon>... | manifest" >&2; exit 1 ;;
esac
