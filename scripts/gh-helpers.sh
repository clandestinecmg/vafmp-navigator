#!/bin/sh
set -e

echo "🔍 Checking latest GitHub Actions run…"

# Get latest run info
LATEST_RUN=$(gh run list --limit 1 --json databaseId,status,conclusion --jq '.[0]')
RUN_ID=$(echo "$LATEST_RUN" | jq -r '.databaseId')
STATUS=$(echo "$LATEST_RUN" | jq -r '.status')
CONCLUSION=$(echo "$LATEST_RUN" | jq -r '.conclusion')

echo "→ Run ID: $RUN_ID"
echo "→ Status: $STATUS"
echo "→ Conclusion: $CONCLUSION"

if [ "$STATUS" = "completed" ] && [ "$CONCLUSION" != "success" ]; then
  echo "❌ Last run failed — re-running…"
  gh run rerun "$RUN_ID"
else
  echo "✅ Last run is healthy. No rerun needed."
fi
