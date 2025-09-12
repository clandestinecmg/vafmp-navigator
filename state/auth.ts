import { create } from 'zustand';
export type AuthUser = { uid: string; email: string | null } | null;
type AuthState = { user: AuthUser; setUser: (u: AuthUser) => void; };
export const useAuthStore = create<AuthState>((set) => ({ user: null, setUser: (u) => set({ user: u }) }));
