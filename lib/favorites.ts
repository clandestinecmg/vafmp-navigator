// lib/favorites.ts
import {
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
  serverTimestamp,
  query,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type Provider = {
  id: string;
  name: string;
  city?: string;
  country?: string;
  billing?: 'Direct' | 'Reimbursement';
  mapsUrl?: string;
};

const providersCol = collection(db, 'providers');
export const providerDoc = (id: string) => doc(providersCol, id);

export const favoritesCol = (uid: string) =>
  collection(db, 'users', uid, 'favorites');

// --- Read favorites (IDs only) for a user ---
export function useFavoriteIds(uid?: string | null) {
  return useQuery({
    queryKey: ['favoriteIds', uid],
    enabled: !!uid,
    queryFn: async () => {
      if (!uid) return [] as string[];
      const snap = await getDocs(query(favoritesCol(uid)));
      return snap.docs.map((d) => d.id); // each doc id == providerId
    },
  });
}

// --- Toggle favorite for a user ---
export function useToggleFavorite(uid?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { providerId: string; next: boolean }) => {
      if (!uid) throw new Error('Not signed in');
      const favDoc = doc(db, 'users', uid, 'favorites', p.providerId);
      if (p.next) {
        await setDoc(favDoc, { createdAt: serverTimestamp() }, { merge: true });
      } else {
        await deleteDoc(favDoc);
      }
    },
    onMutate: async ({ providerId, next }) => {
      if (!uid) return;
      await qc.cancelQueries({ queryKey: ['favoriteIds', uid] });
      const prev = qc.getQueryData<string[]>(['favoriteIds', uid]) || [];
      const optimistic = next
        ? Array.from(new Set([...prev, providerId]))
        : prev.filter((id) => id !== providerId);
      qc.setQueryData(['favoriteIds', uid], optimistic);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev && uid) qc.setQueryData(['favoriteIds', uid], ctx.prev);
    },
    onSettled: () => {
      if (uid) qc.invalidateQueries({ queryKey: ['favoriteIds', uid] });
    },
  });
}