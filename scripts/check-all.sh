#!/usr/bin/env bash
set -euo pipefail
npx prettier --check .
npx eslint . --ext .ts,.tsx
npx tsc --noEmit