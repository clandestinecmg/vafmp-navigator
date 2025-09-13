// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};
const firebaseConfig = {
  apiKey: extra.FB_API_KEY,
  authDomain: extra.FB_AUTH_DOMAIN,
  projectId: extra.FB_PROJECT_ID,
  storageBucket: extra.FB_STORAGE_BUCKET,
  messagingSenderId: extra.FB_SENDER_ID,
  appId: extra.FB_APP_ID,
};

export const app = initializeApp(firebaseConfig);

// Firestore with resilient cache; on RN it may warn about IndexedDB and fall back — that’s fine.
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  localCache: persistentLocalCache(),
});