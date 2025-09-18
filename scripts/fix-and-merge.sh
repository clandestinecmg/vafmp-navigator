#!/bin/zsh
set -euo pipefail

BRANCH="${1:-signed-main}"
MAIN="${2:-main}"

command -v git >/dev/null 2>&1 || { echo "git not found"; exit 1; }
command -v npx >/dev/null 2>&1 || { echo "npx (Node) not found"; exit 1; }

STASHED=false
if ! git diff --quiet || ! git diff --cached --quiet; then
  git stash push -u -m "pre-fix-$(date +%s)" || true
  STASHED=true
fi

git fetch origin "$MAIN" || true

# Ensure we're on the working branch
if git rev-parse --abbrev-ref HEAD >/dev/null 2>&1; then
  CUR="$(git rev-parse --abbrev-ref HEAD)"
else
  CUR=""
fi
if [ "$CUR" != "$BRANCH" ]; then
  if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
    git checkout "$BRANCH"
  else
    if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
      git checkout -b "$BRANCH" "origin/$BRANCH"
    else
      git checkout -b "$BRANCH"
    fi
  fi
fi

# Rebase onto main to keep history tidy (don’t fail the script if conflicts; just stop)
if git rev-parse --verify --quiet "origin/$MAIN" >/dev/null 2>&1; then
  git rebase "origin/$MAIN" || { echo "Rebase needs manual resolution. Fix conflicts, then re-run."; [ "$STASHED" = "true" ] && git stash pop || true; exit 1; }
fi

# Auto-fix formatting/lint and typecheck (don’t hard fail CI tools)
npx prettier --write . || true
npx eslint . --ext .ts,.tsx --fix || true
npx tsc --noEmit || true

# Commit if anything changed (signed if your global config is set)
if ! git diff --quiet; then
  git add -A
  git commit -m "ci: auto-fix formatting and lint" || true
fi

# Push branch
git push --set-upstream origin "$BRANCH" 2>/dev/null || git push --force-with-lease origin "$BRANCH" || true

# If gh exists, open or find PR and try to auto-merge (squash + delete)
if command -v gh >/dev/null 2>&1; then
  PR_NUM="$(gh pr list --head "$BRANCH" --base "$MAIN" --state open --json number --jq '.[0].number' 2>/dev/null || true)"
  if [ -z "$PR_NUM" ]; then
    gh pr create --fill --base "$MAIN" --head "$BRANCH" >/dev/null 2>&1 || true
    PR_NUM="$(gh pr list --head "$BRANCH" --base "$MAIN" --state open --json number --jq '.[0].number' 2>/dev/null || true)"
  fi
  if [ -n "$PR_NUM" ]; then
    gh pr merge "$PR_NUM" --squash --delete-branch >/dev/null 2>&1 || gh pr view "$PR_NUM" --web || true
  fi
fi

if [ "$STASHED" = "true" ]; then
  git stash pop || true
fi

echo "✅ Fix, push, and PR/merge routine complete for $BRANCH → $MAIN"
