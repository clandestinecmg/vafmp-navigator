#!/bin/sh
set -e

echo "✨ Running Prettier..."
npx prettier --write .

echo "🔧 Running ESLint with --fix..."
npm run lint:fix || true

echo "📦 Staging changes..."
git add .

echo "📝 Amending last commit..."
git commit --amend --no-edit || true

echo "🚀 Pushing with --force-with-lease..."
git push --force-with-lease

echo "✅ All fixes (Prettier + ESLint) applied and pushed."
