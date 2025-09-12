#!/usr/bin/env bash
set -euo pipefail

STABLE_BRANCH="stable"
TAG_BASE="stable"
STAMP="$(date +'%Y%m%d-%H%M%S')"
ZIP_OUT="lock-${STAMP}.zip"

# Ensure we're in a git repo
if [ ! -d .git ]; then
  echo "ℹ️  No .git directory found. Initializing a new repo…"
  git init
fi

# Quick sanity note about dependency lock
if [ ! -f package-lock.json ]; then
  echo "⚠️  package-lock.json not found. To fully lock dependencies, run: npm install (or npm ci)"
fi

# Commit current state (or an empty commit)
git add -A
if git diff --cached --quiet; then
  echo "ℹ️  No staged changes. Creating an empty lock commit…"
  git commit --allow-empty -m "Lock: ${TAG_BASE} snapshot ${STAMP}"
else
  git commit -m "Lock: ${TAG_BASE} snapshot ${STAMP}"
fi

# Update/create moving stable branch
echo "🏷  Pointing '${STABLE_BRANCH}' at current commit…"
if git rev-parse --verify "${STABLE_BRANCH}" >/dev/null 2>&1; then
  git branch -f "${STABLE_BRANCH}" HEAD
else
  git branch "${STABLE_BRANCH}" HEAD
fi

# Create unique tag (avoid collisions)
TAG_NAME="${TAG_BASE}-${STAMP}"
if git rev-parse --verify "refs/tags/${TAG_NAME}" >/dev/null 2>&1; then
  n=1
  while git rev-parse --verify "refs/tags/${TAG_NAME}-${n}" >/dev/null 2>&1; do
    n=$((n+1))
  done
  TAG_NAME="${TAG_NAME}-${n}"
fi
git tag -a "${TAG_NAME}" -m "Stable snapshot ${STAMP}"

# Zip snapshot
echo "📦 Archiving snapshot -> ${ZIP_OUT}"
git archive --format=zip --output "${ZIP_OUT}" HEAD

# Auto-push if a remote exists (prefer 'origin', else first remote)
REMOTE=""
if git remote | grep -qx "origin"; then
  REMOTE="origin"
else
  REMOTE="$(git remote | head -n1 || true)"
fi

if [ -n "${REMOTE}" ]; then
  echo "🚀 Pushing to '${REMOTE}' (commit, '${STABLE_BRANCH}', tags)…"
  git push -u "${REMOTE}" HEAD "${STABLE_BRANCH}" --tags
else
  echo "ℹ️  No git remote configured. Skipping push."
  echo "    Add one with: git remote add origin <your-remote-url>"
fi

cat <<MSG

✅ Lock complete.

Restore options:
  • Checkout tag (detached):   git checkout ${TAG_NAME}
  • Moving branch pointer:      git checkout ${STABLE_BRANCH}

Reinstall EXACT dependency tree:
  rm -rf node_modules
  npm ci

ZIP saved at:
  ${ZIP_OUT}
MSG
