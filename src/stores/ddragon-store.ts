import { create } from 'zustand';
import type { DDragonChampion, DDragonItem, DDragonTrait } from '../shared/types/ddragon';

type DdragonStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface DdragonStore {
  readonly status: DdragonStatus;
  readonly version: string | null;
  readonly currentSet: number | null;
  readonly champions: readonly DDragonChampion[];
  readonly items: readonly DDragonItem[];
  readonly traits: readonly DDragonTrait[];
  readonly error: string | null;

  readonly setStatus: (status: DdragonStatus) => void;
  readonly setVersion: (version: string) => void;
  readonly setCurrentSet: (set: number) => void;
  readonly setChampions: (champions: readonly DDragonChampion[]) => void;
  readonly setItems: (items: readonly DDragonItem[]) => void;
  readonly setTraits: (traits: readonly DDragonTrait[]) => void;
  readonly setError: (error: string | null) => void;
}

export const useDdragonStore = create<DdragonStore>((set) => ({
  status: 'idle',
  version: null,
  currentSet: null,
  champions: [],
  items: [],
  traits: [],
  error: null,

  setStatus: (status) => set({ status }),
  setVersion: (version) => set({ version }),
  setCurrentSet: (currentSet) => set({ currentSet }),
  setChampions: (champions) => set({ champions }),
  setItems: (items) => set({ items }),
  setTraits: (traits) => set({ traits }),
  setError: (error) => set({ error }),
}));
