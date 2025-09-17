#!/bin/sh
set -e

echo "🔧 Running ESLint with --fix..."
npm run lint:fix || true

echo "📦 Staging changes..."
git add .

echo "📝 Amending last commit..."
git commit --amend --no-edit || true

echo "🚀 Pushing with --force-with-lease..."
git push --force-with-lease

echo "✅ ESLint fixes applied and pushed."
