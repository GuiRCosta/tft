import { create } from 'zustand';
import type { TFTGameState, CompRecommendation } from '../shared/types';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

interface GameStore {
  readonly connectionStatus: ConnectionStatus;
  readonly gameState: TFTGameState | null;
  readonly isInGame: boolean;
  readonly suggestedComps: readonly CompRecommendation[];
  readonly overlayVisible: boolean;

  readonly setConnectionStatus: (status: ConnectionStatus) => void;
  readonly setGameState: (state: TFTGameState | null) => void;
  readonly setIsInGame: (inGame: boolean) => void;
  readonly setSuggestedComps: (comps: readonly CompRecommendation[]) => void;
  readonly toggleOverlay: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  connectionStatus: 'disconnected',
  gameState: null,
  isInGame: false,
  suggestedComps: [],
  overlayVisible: true,

  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setGameState: (gameState) => set({ gameState }),
  setIsInGame: (isInGame) => set({ isInGame }),
  setSuggestedComps: (suggestedComps) => set({ suggestedComps }),
  toggleOverlay: () => set((state) => ({ overlayVisible: !state.overlayVisible })),
}));
