// hooks/useAuth.tsx
import * as React from 'react';
import {
  auth,
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  type User,
} from '../lib/authApi';

type Ctx = {
  user: User | null;
  initializing: boolean;
  signInAnon: () => Promise<void>;
  signOutNow: () => Promise<void>;
};

const AuthCtx = React.createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(auth.currentUser);
  const [initializing, setInit] = React.useState(true);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u: User | null) => {
      setUser(u);
      setInit(false);
    });
    return () => unsub();
  }, []);

  const signInAnon = React.useCallback(async () => {
    await signInAnonymously(auth);
  }, []);

  const signOutNow = React.useCallback(async () => {
    await signOut(auth);
  }, []);

  const value: Ctx = { user, initializing, signInAnon, signOutNow };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): Ctx {
  const v = React.useContext(AuthCtx);
  if (!v) throw new Error('useAuth must be used within <AuthProvider>');
  return v;
}
