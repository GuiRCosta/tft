import { create } from 'zustand';
import type { TFTGameState, CompRecommendation } from '../shared/types';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

/** Phases where TFT overlay should be visible */
const TFT_ACTIVE_PHASES = new Set(['ChampSelect', 'InProgress']);

interface GameStore {
  readonly connectionStatus: ConnectionStatus;
  readonly summonerName: string | null;
  readonly gameflowPhase: string;
  readonly isTft: boolean;
  readonly gameState: TFTGameState | null;
  readonly isInGame: boolean;
  readonly suggestedComps: readonly CompRecommendation[];
  readonly overlayVisible: boolean;
  readonly autoOverlayEnabled: boolean;

  readonly setConnectionStatus: (status: ConnectionStatus) => void;
  readonly setSummonerName: (name: string | null) => void;
  readonly setGameflowPhase: (phase: string) => void;
  readonly setIsTft: (isTft: boolean) => void;
  readonly setGameState: (state: TFTGameState | null) => void;
  readonly setIsInGame: (inGame: boolean) => void;
  readonly setSuggestedComps: (comps: readonly CompRecommendation[]) => void;
  readonly setOverlayVisible: (visible: boolean) => void;
  readonly toggleOverlay: () => void;
  readonly setAutoOverlayEnabled: (enabled: boolean) => void;
}

/** Whether the overlay should auto-show for a given game phase + TFT status */
export function shouldShowOverlay(phase: string, isTft: boolean): boolean {
  return isTft && TFT_ACTIVE_PHASES.has(phase);
}

export const useGameStore = create<GameStore>((set) => ({
  connectionStatus: 'disconnected',
  summonerName: null,
  gameflowPhase: 'None',
  isTft: false,
  gameState: null,
  isInGame: false,
  suggestedComps: [],
  overlayVisible: false,
  autoOverlayEnabled: true,

  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setSummonerName: (summonerName) => set({ summonerName }),
  setGameflowPhase: (gameflowPhase) => set({ gameflowPhase }),
  setIsTft: (isTft) => set({ isTft }),
  setGameState: (gameState) => set({ gameState }),
  setIsInGame: (isInGame) => set({ isInGame }),
  setSuggestedComps: (suggestedComps) => set({ suggestedComps }),
  setOverlayVisible: (overlayVisible) => set({ overlayVisible }),
  toggleOverlay: () => set((state) => ({ overlayVisible: !state.overlayVisible })),
  setAutoOverlayEnabled: (autoOverlayEnabled) => set({ autoOverlayEnabled }),
}));
