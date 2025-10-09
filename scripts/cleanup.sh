#!/usr/bin/env bash
set -euo pipefail

echo "🧹 Cleaning Expo/Metro caches & old builds…"
rm -rf .expo .expo-shared
rm -rf build dist
rm -rf ios/build android/app/build
rm -rf metro-cache
rm -rf *.log

echo "🧼 Removing old ToastProvider if present…"
rm -f components/ToastProvider.tsx || true

echo "✅ Done. Consider running: npx expo start -c"