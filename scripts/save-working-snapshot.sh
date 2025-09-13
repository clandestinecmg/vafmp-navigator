#!/usr/bin/env bash
set -euo pipefail

SNAP_ROOT="snapshots"
STAMP="$(date +%Y%m%d_%H%M%S)"
SNAP_DIR="$SNAP_ROOT/$STAMP"

mkdir -p "$SNAP_DIR"

echo "== Saving snapshot -> $SNAP_DIR =="

# 1) Hard artifacts
for f in package.json package-lock.json app.config.ts eas.json tsconfig.json; do
  [ -f "$f" ] && cp "$f" "$SNAP_DIR/"
done

# 2) Router entry/layout (optional)
mkdir -p "$SNAP_DIR/app"
[ -f app/index.tsx ] && cp app/index.tsx "$SNAP_DIR/app/"
[ -f app/_layout.tsx ] && cp app/_layout.tsx "$SNAP_DIR/app/"

# 3) Versions report
VERS="$SNAP_DIR/versions.txt"
{
  echo "== SYSTEM =="
  (node -v || true)
  (npm -v || true)
  (npx expo --version || true)
  (eas --version || true)
  echo
  echo "== KEY DEPS =="
  node -e 'try{let p=require("./package.json");["expo","react","react-native","expo-router","@expo/vector-icons","@react-native-async-storage/async-storage","react-native-screens","react-native-safe-area-context"].forEach(k=>{let v=(p.dependencies||{})[k]||(p.devDependencies||{})[k]; if(v) console.log(k, v)});}catch(e){console.error(e)}'
  echo
  echo "== npm tree (top) =="
  (npm ls --depth=0 || true)
} > "$VERS"

# 4) Resolved expo config (captures .env -> extra)
EXPO_JSON="$SNAP_DIR/expo-config.json"
(npx -y expo config --json || true) > "$EXPO_JSON"

echo "Snapshot saved in $SNAP_DIR"
echo "To restore: scripts/restore-from-snapshot.sh \"$SNAP_DIR\""
