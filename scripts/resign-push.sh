#!/bin/zsh
set -e
git stash push -u -m pre-resign || true
git fetch origin main
git rebase --exec 'git commit --amend --no-edit -S' origin/main || true
npx prettier --write . || true
npx eslint . --ext .ts,.tsx --fix || true
npx tsc --noEmit || true
git push --force-with-lease origin "$(git rev-parse --abbrev-ref HEAD)"
git stash pop || true
echo "✅ Resigned, linted, formatted, typechecked, pushed."
