#!/bin/sh
set -e

echo "🔍 Checking Husky hooks..."
echo "hooksPath: $(git config --get core.hooksPath)"

echo "→ Running pre-commit..."
.husky/pre-commit || { echo "❌ pre-commit failed"; exit 1; }

echo "→ Running pre-push..."
.husky/pre-push || { echo "❌ pre-push failed"; exit 1; }

echo "✅ Husky hooks working as expected"
