// types/firebase-auth-react-native.d.ts
// Minimal, TS-only augmentation so we can import from "firebase/auth"
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: any): any;
  export function initializeAuth(app: any, deps?: any): any;
}
