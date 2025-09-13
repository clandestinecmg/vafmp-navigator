#!/usr/bin/env bash
set -euo pipefail

SNAP_DIR="${1:-}"
if [ -z "$SNAP_DIR" ] || [ ! -d "$SNAP_DIR" ]; then
  echo "Usage: $0 snapshots/YYYYMMDD_HHMMSS" >&2
  exit 1
fi

echo "== Restoring from $SNAP_DIR =="

for f in package.json package-lock.json app.config.ts eas.json tsconfig.json; do
  if [ -f "$SNAP_DIR/$f" ]; then
    cp "$SNAP_DIR/$f" "./$f"
    echo "Restored $f"
  fi
done

mkdir -p app
[ -f "$SNAP_DIR/app/index.tsx" ] && cp "$SNAP_DIR/app/index.tsx" app/
[ -f "$SNAP_DIR/app/_layout.tsx" ] && cp "$SNAP_DIR/app/_layout.tsx" app/

echo "== Reinstalling node modules =="
rm -rf node_modules
if [ -f package-lock.json ]; then
  npm ci || npm install
else
  npm install
fi

echo "✅ Restore complete."
echo "Next:"
echo "  - Run dev: npx expo start"
echo "  - (Optional) Prebuild native: npx expo prebuild --clean"
