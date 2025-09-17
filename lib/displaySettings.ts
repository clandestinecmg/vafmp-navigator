// lib/displaySettings.ts
import { create } from 'zustand';

type SizeMode = 'normal' | 'large';
type State = { sizeMode: SizeMode; setSizeMode: (m: SizeMode) => void };

export const useDisplaySettings = create<State>((set) => ({
  sizeMode: 'normal',
  setSizeMode: (m) => set({ sizeMode: m }),
}));
