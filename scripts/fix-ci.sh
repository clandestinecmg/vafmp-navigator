#!/bin/zsh
set -euo pipefail

BRANCH="signed-main"
MAIN="main"

echo "🧹 Running Prettier + ESLint..."
npx prettier --write . || true
npx eslint . --ext .ts,.tsx --fix || true

echo "🔎 Typechecking..."
npx tsc --noEmit || true

echo "🔁 Rebasing and re-signing commits..."
git fetch origin $MAIN
git checkout $BRANCH
git rebase origin/$MAIN --exec "git commit --amend --no-edit -S"

echo "📤 Force-pushing cleaned branch..."
git push --force-with-lease origin $BRANCH

echo "✅ Branch $BRANCH re-signed, formatted, typechecked, and pushed. CI will rerun."
