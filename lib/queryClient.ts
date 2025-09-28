import { QueryClient } from '@tanstack/react-query';
import type { Auth } from 'firebase/auth';

export const queryClient = new QueryClient();

/**
 * Re-invalidate queries whenever auth state changes (anon or full auth).
 */
export function wireAuthRefetch(opts: {
  auth: Auth;
  onAuthStateChanged: (a: Auth, cb: () => void) => () => void;
}) {
  const { auth, onAuthStateChanged } = opts;
  return onAuthStateChanged(auth, () => {
    // Blow away stale user-scoped caches on any auth transition
    queryClient.invalidateQueries();
  });
}
