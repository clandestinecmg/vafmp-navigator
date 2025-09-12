// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache, // ✅ correct symbol
} from 'firebase/firestore';
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

const app = initializeApp(firebaseConfig);

// Auth (memory persistence in Expo Go; we'll switch to AsyncStorage in dev build)
export const auth = getAuth(app);

// Firestore: RN-friendly transport + resilient local cache
export const db = initializeFirestore(app, {
  // prefer long polling when WebChannel is flaky (Expo Go / some networks)
  experimentalAutoDetectLongPolling: true,
  // ‘useFetchStreams’ is not in your SDK’s FirestoreSettings; remove it
  localCache: persistentLocalCache(), // ✅ supported in your typings
});