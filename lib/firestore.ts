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

/** Core provider fields used by the app UI */
export type ProviderBase = {
  id: string;
  name: string;
  city?: string;
  country?: string;
  billing?: 'Direct' | 'Reimbursement' | string | null;
  phone?: string;
  email?: string;
  mapsUrl?: string; // normalized for UI
  placeId?: string;
  lat?: number;
  lng?: number;
};

/** Allow unknown/aux fields (notes, regionTag, etc.) without using `any` */
export type Provider = ProviderBase & Record<string, unknown>;

/** Shape we read from Firestore before normalizing */
type ProviderDoc = Omit<ProviderBase, 'id' | 'mapsUrl'> &
  Partial<Pick<ProviderBase, 'id' | 'mapsUrl'>> & {
    /** legacy key some docs use */
    googleMapsUrl?: string;
  } & Record<string, unknown>;

/** Normalize Firestore doc data -> Provider */
function toProvider(docId: string, raw: ProviderDoc): Provider {
  const id = raw.id ?? docId;

  // Prefer legacy googleMapsUrl, else mapsUrl if present & string
  const mapsUrl =
    (typeof raw.googleMapsUrl === 'string' && raw.googleMapsUrl) ||
    (typeof raw.mapsUrl === 'string' ? raw.mapsUrl : undefined);

  // Drop legacy key so UI sees only normalized fields
  const { googleMapsUrl: _legacy, ...rest } = raw;

  return {
    ...rest,
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

export async function toggleFavorite(
  uid: string,
  providerId: string,
  next: boolean,
): Promise<void> {
  const favRef = doc(db, 'users', uid, 'favorites', providerId);
  if (next) {
    await setDoc(favRef, { createdAt: serverTimestamp() }, { merge: true });
  } else {
    await deleteDoc(favRef);
  }
}

/** Update a provider by doc id (ignore `id` in the patch) */
export async function updateProvider(
  id: string,
  patch: Partial<Provider>,
): Promise<void> {
  const ref = doc(db, 'providers', id);
  const { id: _omit, ...rest } = patch;
  await updateDoc(ref, rest as DocumentData);
}

export async function getProvider(id: string): Promise<Provider | null> {
  const ref = doc(db, 'providers', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return toProvider(snap.id, snap.data() as ProviderDoc);
}