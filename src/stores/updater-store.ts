import { create } from 'zustand';

export type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'installing' | 'error';

export interface UpdateInfo {
  readonly version: string;
  readonly notes: string;
  readonly date: string;
}

interface UpdaterState {
  readonly status: UpdateStatus;
  readonly updateInfo: UpdateInfo | null;
  readonly errorMessage: string | null;
}

interface UpdaterActions {
  readonly setStatus: (status: UpdateStatus) => void;
  readonly setUpdateInfo: (info: UpdateInfo | null) => void;
  readonly setErrorMessage: (message: string | null) => void;
  readonly reset: () => void;
}

type UpdaterStore = UpdaterState & UpdaterActions;

const INITIAL_STATE: UpdaterState = {
  status: 'idle',
  updateInfo: null,
  errorMessage: null,
};

export const useUpdaterStore = create<UpdaterStore>((set) => ({
  ...INITIAL_STATE,

  setStatus: (status) => set({ status }),
  setUpdateInfo: (updateInfo) => set({ updateInfo }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  reset: () => set(INITIAL_STATE),
}));
