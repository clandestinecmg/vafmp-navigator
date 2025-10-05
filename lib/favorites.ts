//lib/favorites.ts
import {
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
  serverTimestamp,
  query,
} from 'firebase/firestore';
import { db } from './firebase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const favoritesCol = (uid: string) =>
  collection(db, 'users', uid, 'favorites');

/** Read favorite IDs for a user (array of provider IDs) */
export function useFavoriteIds(uid?: string | null) {
  return useQuery({
    queryKey: ['favoriteIds', uid],
    enabled: !!uid,
    queryFn: async () => {
      if (!uid) return [] as string[];
      const snap = await getDocs(query(favoritesCol(uid)));
      return snap.docs.map((d) => d.id);
    },
  });
}

/** Toggle favorite with optimistic UI */
export function useToggleFavorite(uid?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      providerId,
      next,
    }: {
      providerId: string;
      next: boolean;
    }) => {
      if (!uid) throw new Error('Not signed in');
      const favDoc = doc(db, 'users', uid, 'favorites', providerId);
      if (next) {
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
      if (uid && ctx?.prev) qc.setQueryData(['favoriteIds', uid], ctx.prev);
    },
    onSettled: () => {
      if (uid) qc.invalidateQueries({ queryKey: ['favoriteIds', uid] });
    },
  });
}
