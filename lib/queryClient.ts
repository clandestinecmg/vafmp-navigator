import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export function wireAuthRefetch(opts: {
  auth: unknown;
  onAuthStateChanged: (a: unknown, cb: () => void) => () => void;
}) {
  const { auth, onAuthStateChanged } = opts;
  return onAuthStateChanged(auth, () => {
    queryClient.invalidateQueries();
  });
}
