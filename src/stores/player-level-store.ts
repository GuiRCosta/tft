import { create } from 'zustand';
import { MIN_LEVEL, MAX_LEVEL } from '../shared/constants/xp-table';

interface PlayerLevelStore {
  readonly level: number;
  readonly incrementLevel: () => void;
  readonly decrementLevel: () => void;
  readonly resetLevel: () => void;
}

export const usePlayerLevelStore = create<PlayerLevelStore>((set) => ({
  level: 1,

  incrementLevel: () =>
    set((state) => ({
      level: Math.min(state.level + 1, MAX_LEVEL),
    })),

  decrementLevel: () =>
    set((state) => ({
      level: Math.max(state.level - 1, MIN_LEVEL),
    })),

  resetLevel: () => set({ level: 1 }),
}));
