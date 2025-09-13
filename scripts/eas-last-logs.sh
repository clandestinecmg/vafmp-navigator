#!/usr/bin/env bash
set -euo pipefail

PLATFORM="${1:-android}"  # android | ios

echo "Fetching latest $PLATFORM build…"
JSON="$(eas build:list --platform "$PLATFORM" --limit 1 --json --non-interactive || true)"
if [ -z "$JSON" ]; then
  echo "No build JSON returned."
  exit 1
fi

BUILD_ID="$(node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync(0,'utf8')); console.log(d[0]?.id||'');" <<<"$JSON")"
LOGS_URL="$(node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync(0,'utf8')); console.log(d[0]?.logsUrl||'');" <<<"$JSON")"

echo "Build: $BUILD_ID"
echo "Logs:  $LOGS_URL"

if [ -z "$LOGS_URL" ] || [ "$LOGS_URL" = "null" ]; then
  echo "No logsUrl yet (build may not have started or finished)."
  exit 0
fi

OUT="eas_build_${BUILD_ID}.log"
curl -sSL "$LOGS_URL" -o "$OUT"
echo "Saved -> $OUT"

echo "===== Run gradlew (first 400 lines after that marker) ====="
awk '/Run gradlew/{flag=1} flag{print}' "$OUT" | sed -n '1,400p' || true

echo "===== FAILED lines ====="
grep -n " FAILED" "$OUT" || true
grep -n "Execution failed for task" "$OUT" || true
