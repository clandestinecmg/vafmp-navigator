# VAFMP Navigator

A React Native + Expo app (Expo Router, TanStack Query, Firebase Auth/Firestore) for finding, favoriting, and contacting VAFMP providers, plus resources and crisis info.

---

## Prerequisites

- Node.js 18+
- npm 9+ (or pnpm/yarn if you prefer)
- Expo CLI (auto-installed via `npx expo start`)
- Firebase project (for Auth + Firestore)

---

## Quick Start

```bash
# 1) Install deps
npm install

# 2) Copy env template and fill in with your Firebase + Expo values
cp .env.example .env
# edit .env

# 3) Run (clean Metro cache on start)
npx expo start -c