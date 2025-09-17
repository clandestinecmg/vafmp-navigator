#!/bin/sh
set -e

echo "✨ Running Prettier across repo..."
npx prettier --write .

echo "📦 Staging changes..."
git add .

echo "📝 Amending last commit..."
git commit --amend --no-edit || true

echo "🚀 Pushing with --force-with-lease..."
git push --force-with-lease

echo "✅ Prettier fixes applied and pushed."
