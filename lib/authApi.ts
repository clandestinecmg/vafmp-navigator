// lib/authApi.ts
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

let _auth: unknown;
try {
  _auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  _auth = getAuth(app);
}
const auth = _auth as ReturnType<typeof getAuth>;

export { auth, onAuthStateChanged, signInAnonymously, signOut };
export type { User, Unsubscribe };
