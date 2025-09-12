// lib/firestore.ts
import { db } from './firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';

export type Provider = {
  id: string;
  name: string;
  country?: string;
  city?: string;
  billing?: 'Direct' | 'Reimbursement';
  phone?: string;
  email?: string;
  mapsUrl?: string;
};

export async function getAllProviders(): Promise<Provider[]> {
  const snapshot = await getDocs(collection(db, 'providers'));
  return snapshot.docs.map((d) => {
    const data = d.data() as Partial<Omit<Provider, 'id'>>;
    return {
      id: d.id,
      name: data.name ?? '(Unnamed)',
      country: data.country ?? undefined,
      city: data.city ?? undefined,
      billing: (data.billing as Provider['billing']) ?? undefined,
      phone: data.phone ?? undefined,
      email: data.email ?? undefined,
      mapsUrl: data.mapsUrl ?? undefined,
    } as Provider;
  });
}

export async function getFavoriteIds(uid: string): Promise<string[]> {
  const docRef = doc(db, 'favorites', uid);
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data().ids as string[]) : [];
}

export async function toggleFavorite(uid: string, providerId: string, on: boolean) {
  const favRef = doc(db, 'favorites', uid);
  const snap = await getDoc(favRef);
  let ids: string[] = snap.exists() ? (snap.data().ids as string[]) : [];

  if (on) {
    if (!ids.includes(providerId)) ids.push(providerId);
  } else {
    ids = ids.filter((id) => id !== providerId);
  }

  await setDoc(favRef, { ids });
}