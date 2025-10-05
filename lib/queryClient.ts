// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

/** Optional helper: invalidate all queries on auth state changes */
export function wireAuthRefetch(opts: {
  auth: unknown;
  onAuthStateChanged: (auth: unknown, cb: () => void) => () => void;
}) {
  const { auth, onAuthStateChanged } = opts;
  return onAuthStateChanged(auth, () => {
    queryClient.invalidateQueries();
  });
}
