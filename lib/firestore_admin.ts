// lib/firestore_admin.ts
// ⚠️ Dev/Admin only. If this ever ships in prod UI, future-you must buy present-you a coffee. ☕

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  writeBatch,
  deleteField,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { app } from './firebase';

// Centralized Firestore for admin tools
export const adminDb = getFirestore(app);

// Re-export common helpers so screens can import from one place
export {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  writeBatch,
  deleteField,
  onSnapshot,
  query,
  where,
};
