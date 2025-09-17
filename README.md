# VAFMP Navigator

[![CI](https://github.com/clandestinecmg/vafmp-navigator/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/clandestinecmg/vafmp-navigator/actions/workflows/ci.yml)
![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)
![ESLint](https://img.shields.io/badge/lint-eslint-4B32C3.svg)
![TypeScript](https://img.shields.io/badge/language-typescript-3178C6.svg)
![Tests](https://github.com/clandestinecmg/vafmp-navigator/actions/workflows/test.yml/badge.svg?branch=main)
[![Coverage](https://codecov.io/gh/clandestinecmg/vafmp-navigator/branch/main/graph/badge.svg)](https://codecov.io/gh/clandestinecmg/vafmp-navigator)
[![Security](https://github.com/clandestinecmg/vafmp-navigator/actions/workflows/security.yml/badge.svg?branch=main)](https://github.com/clandestinecmg/vafmp-navigator/actions/workflows/security.yml)
[![Dependencies](https://img.shields.io/librariesio/github/clandestinecmg/vafmp-navigator)](https://libraries.io/github/clandestinecmg/vafmp-navigator)
[![License](https://img.shields.io/github/license/clandestinecmg/vafmp-navigator.svg)](LICENSE)

[![CI](https://github.com/clandestinecmg/vafmp-navigator/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/clandestinecmg/vafmp-navigator/actions/workflows/ci.yml)
![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)
![ESLint](https://img.shields.io/badge/lint-eslint-4B32C3.svg)
![TypeScript](https://img.shields.io/badge/language-typescript-3178C6.svg)

A React Native + Expo app (Expo Router, TanStack Query, Firebase Auth/Firestore) for finding, favoriting, and contacting VAFMP providers, plus resources and crisis info.

---

## Prerequisites

- macOS (Apple Silicon recommended, tested on 2024 MacBook Pro M4)
- Node.js 18+
- npm 9+
- Expo CLI (auto-installed via `npx expo start`)
- Firebase project (for Auth + Firestore)
- VSCode with extensions:
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [TypeScript Next](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next)

---

## Quick Start

```bash
# 1) Install dependencies
npm install

# 2) Copy env template and fill in with your Firebase + Expo values
cp .env.example .env
# edit .env

# 3) Start the app (clear Metro cache for safety)
npx expo start -c
```
