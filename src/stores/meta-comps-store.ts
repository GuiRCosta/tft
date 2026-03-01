import { create } from 'zustand';
import type { RawMetaComp } from '../shared/types/meta-comps';

type MetaCompsStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface MetaCompsStore {
  readonly status: MetaCompsStatus;
  readonly version: string | null;
  readonly patch: string | null;
  readonly comps: readonly RawMetaComp[];
  readonly error: string | null;

  readonly setStatus: (status: MetaCompsStatus) => void;
  readonly setVersion: (version: string) => void;
  readonly setPatch: (patch: string) => void;
  readonly setComps: (comps: readonly RawMetaComp[]) => void;
  readonly setError: (error: string | null) => void;
}

export const useMetaCompsStore = create<MetaCompsStore>((set) => ({
  status: 'idle',
  version: null,
  patch: null,
  comps: [],
  error: null,

  setStatus: (status) => set({ status }),
  setVersion: (version) => set({ version }),
  setPatch: (patch) => set({ patch }),
  setComps: (comps) => set({ comps }),
  setError: (error) => set({ error }),
}));
