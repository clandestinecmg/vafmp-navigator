#!/usr/bin/env bash
set -euo pipefail

branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
upstream="$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || true)"
status="$(git status --porcelain || true)"

# 1) On main: remind to branch
if [[ "$branch" == "main" ]]; then
  if [[ -z "$status" ]]; then
    echo "✅ You're on main and clean. Start new work with:"
    echo "   git switch -c feat/<short-name>"
  else
    echo "⚠️ You're on main with uncommitted changes. Commit or stash before branching."
  fi
fi

# 2) On feature branches: remind to open/merge PR
if [[ "$branch" != "main" ]]; then
  prnum="$(gh pr view --json number -q .number 2>/dev/null || true)"
  if [[ -z "${prnum:-}" ]]; then
    echo "💡 No PR found for '$branch'. Create one:"
    echo "   gh pr create --base main --head $branch -t 'feat: <title>' -b '<description>'"
  else
    echo "🔗 PR #$prnum exists for '$branch'. Merge when checks are green:"
    echo "   gh pr merge $prnum --squash --delete-branch --admin"
  fi
fi

# 3) If behind upstream: suggest fast-forward
if [[ -n "$upstream" ]]; then
  counts="$(git rev-list --left-right --count "$upstream...HEAD" 2>/dev/null || echo '0 0')"
  behind="$(awk '{print $1}' <<<"$counts")"
  if [[ "$behind" -gt 0 ]]; then
    echo "⬇️ You're behind $upstream by $behind commit(s). Update with:"
    echo "   git pull --ff-only"
  fi
fi
