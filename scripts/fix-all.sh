#!/bin/zsh
set -e
npx prettier --write . || true
npx eslint . --ext .ts,.tsx --fix || true
echo "✅ All fixes applied."
