// hooks/useAuth.ts
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, onAuthStateChanged, type User } from '../lib/authApi';

interface AuthContextValue {
  user: User | null;
}

const AuthContext = createContext<AuthContextValue>({ user: null });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u: User | null) =>
      setUser(u),
    );
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => useContext(AuthContext);
