# VAFMP Navigator

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
