#!/bin/bash
set -e

echo "== 1) Rewrite imports to use lib/authApi =="
# Replace any remaining firebase.ts imports with authApi
grep -Rl --exclude-dir=node_modules --exclude-dir=.git "from '../../lib/firebase'" app \
  | xargs sed -i.bak "s#from '../../lib/firebase'#from '../../lib/authApi'#g" || true
grep -Rl --exclude-dir=node_modules --exclude-dir=.git "from \"../../lib/firebase\"" app \
  | xargs sed -i.bak "s#from \"../../lib/firebase\"#from \"../../lib/authApi\"#g" || true
rm -f app/**/*.bak

# --- 2) Sanity check: no direct firebase/auth imports left in app/ (only in lib/authApi.ts and lib/firebase.ts) ---
echo "== 2) Scan for direct firebase/auth imports =="
grep -RIn --exclude-dir=node_modules --exclude-dir=.git "from 'firebase/auth'" app lib \
  | grep -v -E 'lib/authApi\.ts|lib/firebase\.ts' || echo "OK: no direct single-quoted imports."
grep -RIn --exclude-dir=node_modules --exclude-dir=.git "from \"firebase/auth\"" app lib \
  | grep -v -E 'lib/authApi\.ts|lib/firebase\.ts' || echo "OK: no direct double-quoted imports."

# --- 3) TypeScript pass ---
echo "== 3) TypeScript check =="
npx tsc --noEmit || true

# --- 4) Clean Metro caches & restart Expo ---
echo "== 4) Cleaning Metro cache and restarting Expo =="
watchman watch-del-all 2>/dev/null || true
rm -rf "$TMPDIR/metro-"* "$TMPDIR/haste-map-"* 2>/dev/null || true
npx expo start -c

# --- 5) Git sanity snapshot ---
echo "== 5) Git status & diff summary =="
git status -s
git diff --stat
