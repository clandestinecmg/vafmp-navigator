#!/usr/bin/env bash
set -euo pipefail

SNAP_DIR="${1:-}"
if [ -z "$SNAP_DIR" ] || [ ! -d "$SNAP_DIR" ]; then
  echo "Usage: $0 snapshots/YYYYMMDD_HHMMSS" >&2
  exit 1
fi

echo "== Restoring from $SNAP_DIR =="

# --- Merge package.json, but keep current "scripts" (current wins) ---
if [ -f "$SNAP_DIR/package.json" ]; then
  node - "$SNAP_DIR/package.json" <<'NODE'
const fs = require('fs');
const dstPath = 'package.json';
const snapPath = process.argv[2];

const cur = fs.existsSync(dstPath) ? JSON.parse(fs.readFileSync(dstPath, 'utf8')) : {};
const snap = JSON.parse(fs.readFileSync(snapPath, 'utf8'));

const merged = {
  ...snap,
  scripts: { ...(snap.scripts || {}), ...(cur.scripts || {}) },
};

fs.writeFileSync(dstPath, JSON.stringify(merged, null, 2) + '\n');
console.log('Merged package.json (preserved current scripts)');
NODE
  echo "Restored package.json (merged)"
fi

# --- Copy the rest of the tracked files (excluding package.json we just merged) ---
for f in package-lock.json app.config.ts eas.json tsconfig.json; do
  if [ -f "$SNAP_DIR/$f" ]; then
    cp "$SNAP_DIR/$f" "./$f"
    echo "Restored $f"
  fi
done

# --- Optional: restore a couple of router entry files if present ---
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
