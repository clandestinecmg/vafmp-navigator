// Minimal ambient declarations for the Firebase Auth APIs we actually use.
// This augments the existing module so TypeScript stops yelling,
// while runtime keeps using the real SDK implementations.

declare module 'firebase/auth' {
  // Basic shapes
  export interface User {
    uid: string;
    // add fields as you need them later
  }
  export type Unsubscribe = () => void;

  // Core APIs used in your code
  export function getAuth(app?: any): any;
  export function onAuthStateChanged(auth: any, nextOrObserver: any): Unsubscribe;
  export function signInAnonymously(auth: any): Promise<any>;
  export function signOut(auth: any): Promise<void>;
  // add to your existing `declare module 'firebase/auth' { ... }` block:
export function initializeAuth(app: any, opts: any): any
export function getReactNativePersistence(storage: any): any
}
