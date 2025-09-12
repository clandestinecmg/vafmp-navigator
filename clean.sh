#!/usr/bin/env zsh
set -e

print -P "%F{cyan}▶ Cleaning caches (zsh-safe globs)…%f"

# Ignore unmatched globs in zsh
setopt NULL_GLOB

# Metro / Haste / Expo caches
rm -rf "${TMPDIR%/}"/metro-* "${TMPDIR%/}"/haste-map-*
rm -rf node_modules/.cache .expo .expo-shared

print -P "%F{cyan}▶ Reinstalling deps…%f"
rm -rf node_modules package-lock.json
npm install

print -P "%F{cyan}▶ Ensuring required Expo modules…%f"
# Icons
npx expo install @expo/vector-icons
# AsyncStorage (for persistence in dev builds, later)
npx expo install @react-native-async-storage/async-storage
# Mail composer (Resources page email)
if ! npm ls --depth=0 expo-mail-composer >/dev/null 2>&1; then
  npx expo install expo-mail-composer
  print -P "%F{yellow}ℹ Add this to app.config.ts if not present:%f
  plugins: [
    'expo-mail-composer',
  ]"
fi

print -P "%F{cyan}▶ Type-check (no emit)…%f"
npx tsc --noEmit || true

print -P "%F{green}✅ Done. Start with:%f  npx expo start -c"
