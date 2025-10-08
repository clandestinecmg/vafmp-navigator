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

/** Core provider fields (direct-billing only, no billing field) */
export type Provider = {
  id: string;
  name: string;
  city?: string;
  country?: string; // can be "TH", "Thailand", etc.
  regionTag?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  mapsUrl?: string; // normalized
  placeId?: string;
  tags?: string[];
};

/** Shape read from Firestore before normalization */
type ProviderDoc = Omit<Provider, 'id' | 'mapsUrl'> &
  Partial<Pick<Provider, 'id' | 'mapsUrl'>> & {
    googleMapsUrl?: string; // legacy
  } & Record<string, unknown>;

/** Normalize Firestore doc data → Provider */
function toProvider(docId: string, raw: ProviderDoc): Provider {
  const id = raw.id ?? docId;
  const mapsUrl =
    (typeof raw.googleMapsUrl === 'string' && raw.googleMapsUrl) ||
    (typeof raw.mapsUrl === 'string' ? raw.mapsUrl : undefined);

  const { googleMapsUrl: _legacy, ...rest } = raw;

  return {
    ...rest,
    id,
    mapsUrl,
  } as Provider;
}

/** Read-only list used by the app (TH + PH only, tolerant) */
export async function getAllProviders(): Promise<Provider[]> {
  const snap = await getDocs(collection(db, 'providers'));
  const list = snap.docs.map((d) => toProvider(d.id, d.data() as ProviderDoc));

  return list.filter((p) => {
    const c = (p.country ?? '').toLowerCase().trim();
    // accept "th", "thailand", and anything containing those
    const isTH = c === 'th' || c.includes('thailand') || c.startsWith('th');
    const isPH = c === 'ph' || c.includes('philippines') || c.startsWith('ph');
    return isTH || isPH;
  });
}

/** Favorites under /users/{uid}/favorites/{providerId} */
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
