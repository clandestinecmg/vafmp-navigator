#!/usr/bin/env bash
set -euo pipefail

PLATFORM="${1:-android}"      # android | ios
PROFILE="${2:-development}"   # development | preview | production

echo "== Snapshotting current workspace =="
scripts/save-working-snapshot.sh

echo "== EAS build ($PLATFORM / $PROFILE) =="
eas build --profile "$PROFILE" --platform "$PLATFORM"

echo "== Fetching logs for latest build =="
scripts/eas-last-logs.sh "$PLATFORM" || true

echo "✅ Done."
