#!/bin/zsh
set -euo pipefail

# Usage: run from repo root. Example: zsh scripts/resign-and-merge-signed.sh signed-main
BRANCH="${1:-signed-main}"
MAIN_BRANCH="${2:-main}"

# Preconditions
command -v git >/dev/null 2>&1 || { echo "git not found"; exit 1; }
command -v npx >/dev/null 2>&1 || { echo "npx not found"; exit 1; }
# gh is optional (merge step). If absent we'll skip automatic merge.
if command -v gh >/dev/null 2>&1; then
  GH_AVAILABLE=1
else
  GH_AVAILABLE=0
fi

echo "📦 Starting resign & merge script"
echo "Branch: $BRANCH  Main: $MAIN_BRANCH"

# 1) Ensure we are in a git repo
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not inside a git repo. Exit."
  exit 1
fi

# 2) Ensure commit signing config (ssh signing)
mkdir -p "$HOME/.config/git"
git config --global gpg.format ssh || true
git config --global user.signingkey "${HOME}/.ssh/id_ed25519" || true
git config --global commit.gpgsign true || true
git config --global gpg.ssh.allowedSignersFile "$HOME/.config/git/allowed_signers" || true

# Build allowed_signers entry (email + public key)
GIT_EMAIL="$(git config user.email || true)"
if [ -z "$GIT_EMAIL" ]; then
  echo "Warning: git user.email not configured. Set it and re-run."
else
  if [ -f "$HOME/.ssh/id_ed25519.pub" ]; then
    printf "%s %s\n" "$GIT_EMAIL" "$(cat "$HOME/.ssh/id_ed25519.pub")" > "$HOME/.config/git/allowed_signers"
    echo "✅ allowed_signers written to $HOME/.config/git/allowed_signers"
  else
    echo "Warning: $HOME/.ssh/id_ed25519.pub not found. Add your SSH public key there and re-run."
  fi
fi

# 3) Stash local changes (if any)
STASHED=false
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "🔒 Stashing local changes..."
  git stash push -u -m "pre-resign-$(date +%s)" || true
  STASHED=true
fi

# 4) Fetch latest
git fetch origin "$MAIN_BRANCH" || git fetch origin || true

# 5) Checkout branch (create/tracking if needed)
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git checkout "$BRANCH"
else
  # If branch doesn't exist locally, try to fetch from origin
  if git ls-remote --exit-code --heads origin "refs/heads/$BRANCH" >/dev/null 2>&1; then
    git checkout -b "$BRANCH" "origin/$BRANCH"
  else
    echo "Branch $BRANCH not found locally or on origin. Exiting."
    [ "$STASHED" = "true" ] && git stash pop || true
    exit 1
  fi
fi

# 6) Rebase onto origin/main while re-signing each commit
echo "🔁 Rebasing $BRANCH onto origin/$MAIN_BRANCH and re-signing commits..."
# Use --keep-empty to avoid dropping empties; allow failures and proceed
git rebase "origin/$MAIN_BRANCH" --exec "git commit --amend --no-edit -S" || {
  echo "⚠️ Rebase reported conflicts or issues. Please resolve manually and re-run the script."
  [ "$STASHED" = "true" ] && git stash pop || true
  exit 1
}

# 7) Run quick fixers (prettier, eslint auto-fix where possible)
echo "🧹 Running format + lint fixes (prettier + eslint --fix) where available..."
npx prettier --write . || true
npx eslint . --ext .ts,.tsx --fix || true
# Typecheck
npx tsc --noEmit || true

# 8) Force-push re-signed branch
echo "📤 Force-pushing re-signed branch to origin/$BRANCH..."
git push --force-with-lease origin "$BRANCH" || {
  echo "⚠️ Push failed. If branch protection blocks direct push, open a PR manually from $BRANCH -> $MAIN_BRANCH."
  [ "$STASHED" = "true" ] && git stash pop || true
  exit 1
}

# 9) If gh is available, find PR and attempt merge (squash + delete branch)
if [ "$GH_AVAILABLE" -eq 1 ]; then
  echo "🔎 Looking for an open PR from $BRANCH..."
  PR_NUM="$(gh pr list --head "$BRANCH" --state open --json number --jq '.[0].number' 2>/dev/null || true)"
  if [ -n "$PR_NUM" ]; then
    echo "ℹ️ Found PR #$PR_NUM — attempting to merge (squash + delete-branch)..."
    # Try to merge (this may fail if required checks are not passing; we'll report status)
    if gh pr merge "$PR_NUM" --squash --delete-branch --body "Squash-merged via script to apply signed commits." >/dev/null 2>&1; then
      echo "✅ PR #$PR_NUM merged and branch deleted."
    else
      echo "⚠️ Could not merge PR #$PR_NUM automatically (status checks or protections may block)."
      echo "Open the PR in the browser: $(gh pr view "$PR_NUM" --web 2>/dev/null || echo 'gh pr view failed')"
    fi
  else
    echo "ℹ️ No open PR found for $BRANCH. Create one manually if needed."
  fi
else
  echo "⚠️ gh CLI not available; skipping automatic PR merge. Install and 'gh auth login' to enable auto-merge."
fi

# 10) Restore stash if any
if [ "$STASHED" = "true" ]; then
  echo "♻️ Restoring stashed local changes..."
  git stash pop || true
fi

echo "🎉 Done. Branch $BRANCH re-signed and pushed. If a PR existed, merge attempted (see output)."
