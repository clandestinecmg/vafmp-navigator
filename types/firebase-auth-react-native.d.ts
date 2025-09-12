// types/firebase-auth-react-native.d.ts
declare module 'firebase/auth/react-native' {
  import type { Auth, Dependencies, FirebaseApp } from 'firebase/auth';
  export function getReactNativePersistence(storage: any): any;
  export function initializeAuth(app: FirebaseApp, deps?: Dependencies): Auth;
}