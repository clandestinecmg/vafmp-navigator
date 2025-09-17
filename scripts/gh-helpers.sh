#!/bin/sh
set -e

WORKFLOW_NAME="$1"

if [ -n "$WORKFLOW_NAME" ]; then
  echo "🔍 Checking latest run for workflow: $WORKFLOW_NAME"
  LATEST_RUN=$(gh run list --workflow "$WORKFLOW_NAME" --limit 1 --json databaseId,status,conclusion --jq '.[0]')
else
  echo "🔍 Checking latest run (any workflow)…"
  LATEST_RUN=$(gh run list --limit 1 --json databaseId,status,conclusion --jq '.[0]')
fi

if [ -z "$LATEST_RUN" ]; then
  echo "⚠️  No runs found for this repo/workflow."
  exit 0
fi

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
  echo "✅ Run is healthy. No rerun needed."
fi
