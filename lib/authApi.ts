// lib/authApi.ts
// Centralized Firebase Auth wiring with RN persistence when available.

import { app } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  type User,
  type Unsubscribe,
} from 'firebase/auth';

/**
 * Try to initialize Auth with React Native persistence.
 * If that fails (already initialized / non-RN env), fall back to getAuth(app).
 */
let _auth: unknown;
try {
  _auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  _auth = getAuth(app);
}

// Infer the correct Auth type from getAuth's return type; no explicit Auth import needed.
const auth = _auth as ReturnType<typeof getAuth>;

// Re-export a stable surface for the rest of the app.
export { auth, onAuthStateChanged, signInAnonymously, signOut };
export type { User, Unsubscribe };
