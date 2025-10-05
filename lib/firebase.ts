// lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCMJhi7Wxs4VaKv9pIYdQ18ljNZVM8vPjI',
  authDomain: 'vafmp-navigator.firebaseapp.com',
  projectId: 'vafmp-navigator',
  storageBucket: 'vafmp-navigator.appspot.com',
  messagingSenderId: '3377373098',
  appId: '1:3377373098:web:17a3bb32cc893e4c2e15d3',
};

export const app = getApps().length
  ? getApps()[0]!
  : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
