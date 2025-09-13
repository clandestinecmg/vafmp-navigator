// lib/firestore.ts
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  updateDoc,
  getDoc,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

export type Provider = {
  id: string;
  name: string;
  city?: string;
  country?: string;
  billing?: 'Direct' | 'Reimbursement' | string | null;
  phone?: string;
  email?: string;
  mapsUrl?: string;        // normalized for UI
  placeId?: string;
  lat?: number;
  lng?: number;
  [key: string]: any;      // keep any extra fields (notes, regionTag, etc.)
};

/** Shape we read from Firestore before normalizing */
type ProviderDoc = Omit<Provider, 'id' | 'mapsUrl'> &
  Partial<Pick<Provider, 'id'>> & {
    googleMapsUrl?: string; // many of your docs use this
  };

/** Normalize Firestore doc data -> Provider */
function toProvider(docId: string, raw: ProviderDoc): Provider {
  // prefer embedded id, then fallback to doc id
  const id = raw.id ?? docId;

  // normalize mapsUrl field
  const mapsUrl = raw.googleMapsUrl ?? (raw as any).mapsUrl;

  // Build final Provider (assert name exists; your seed shows it does)
  return {
    ...raw,
    id,
    mapsUrl,
  } as Provider;
}

/** Read-only list used by the app */
export async function getAllProviders(): Promise<Provider[]> {
  const snap = await getDocs(collection(db, 'providers'));
  return snap.docs.map((d) => toProvider(d.id, d.data() as ProviderDoc));
}

/** Favorites live under /users/{uid}/favorites/{providerId} */
export async function getFavoriteIds(uid: string): Promise<string[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'favorites'));
  return snap.docs.map((d) => d.id);
}

export async function toggleFavorite(uid: string, providerId: string, next: boolean) {
  const favRef = doc(db, 'users', uid, 'favorites', providerId);
  if (next) {
    await setDoc(favRef, { createdAt: serverTimestamp() }, { merge: true });
  } else {
    await deleteDoc(favRef);
  }
}

/** Update a provider by doc id (ignore `id` in the patch) */
export async function updateProvider(id: string, patch: Partial<Provider>) {
  const ref = doc(db, 'providers', id);
  const { id: _omit, ...rest } = patch;
  // Firestore’s UpdateData typing is strict; cast is fine for our partials
  await updateDoc(ref, rest as DocumentData);
}

export async function getProvider(id: string): Promise<Provider | null> {
  const ref = doc(db, 'providers', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return toProvider(snap.id, snap.data() as ProviderDoc);
}