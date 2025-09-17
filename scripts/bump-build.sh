#!/usr/bin/env bash
set -euo pipefail
FILE="app.config.ts"

# bump android versionCode
current_android=$(node -e "let s=require('fs').readFileSync('$FILE','utf8'); let m=s.match(/versionCode:\s*(\d+)/); console.log(m?m[1]:'');")
[ -z "$current_android" ] && { echo "No android.versionCode found"; exit 1; }
next_android=$((current_android+1))
sed -i '' -E "s/(versionCode:\s*)$current_android/\1$next_android/" "$FILE"

# bump ios buildNumber (as string)
current_ios=$(node -e "let s=require('fs').readFileSync('$FILE','utf8'); let m=s.match(/buildNumber:\s*'(\d+)'/); console.log(m?m[1]:'');")
[ -z "$current_ios" ] && { echo "No ios.buildNumber found"; exit 1; }
next_ios=$((current_ios+1))
sed -i '' -E "s/(buildNumber:\s*)'${current_ios}'/\1'${next_ios}'/" "$FILE"

echo "✅ Bumped: android.versionCode $current_android → $next_android, ios.buildNumber $current_ios → $next_ios"
git add "$FILE" && git commit -m "chore: bump build numbers to $next_android / $next_ios" || true
