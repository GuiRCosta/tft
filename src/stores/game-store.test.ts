import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore, shouldShowOverlay } from './game-store';

describe('shouldShowOverlay', () => {
  it('returns true for ChampSelect + TFT', () => {
    expect(shouldShowOverlay('ChampSelect', true)).toBe(true);
  });

  it('returns true for InProgress + TFT', () => {
    expect(shouldShowOverlay('InProgress', true)).toBe(true);
  });

  it('returns false for InProgress + non-TFT', () => {
    expect(shouldShowOverlay('InProgress', false)).toBe(false);
  });

  it('returns false for non-active phases even if TFT', () => {
    expect(shouldShowOverlay('None', true)).toBe(false);
    expect(shouldShowOverlay('Lobby', true)).toBe(false);
    expect(shouldShowOverlay('EndOfGame', true)).toBe(false);
    expect(shouldShowOverlay('WaitingForStats', true)).toBe(false);
  });

  it('returns false for unknown phases', () => {
    expect(shouldShowOverlay('SomethingNew', true)).toBe(false);
  });
});

describe('useGameStore', () => {
  beforeEach(() => {
    useGameStore.setState({
      connectionStatus: 'disconnected',
      summonerName: null,
      gameflowPhase: 'None',
      isTft: false,
      gameState: null,
      isInGame: false,
      suggestedComps: [],
      overlayVisible: false,
      autoOverlayEnabled: true,
    });
  });

  it('has correct default values', () => {
    const state = useGameStore.getState();
    expect(state.connectionStatus).toBe('disconnected');
    expect(state.summonerName).toBeNull();
    expect(state.gameflowPhase).toBe('None');
    expect(state.isTft).toBe(false);
    expect(state.overlayVisible).toBe(false);
    expect(state.autoOverlayEnabled).toBe(true);
  });

  it('setConnectionStatus updates status', () => {
    useGameStore.getState().setConnectionStatus('connected');
    expect(useGameStore.getState().connectionStatus).toBe('connected');
  });

  it('setSummonerName updates name', () => {
    useGameStore.getState().setSummonerName('TestPlayer');
    expect(useGameStore.getState().summonerName).toBe('TestPlayer');
  });

  it('setGameflowPhase updates phase', () => {
    useGameStore.getState().setGameflowPhase('InProgress');
    expect(useGameStore.getState().gameflowPhase).toBe('InProgress');
  });

  it('setIsTft updates isTft', () => {
    useGameStore.getState().setIsTft(true);
    expect(useGameStore.getState().isTft).toBe(true);
  });

  it('toggleOverlay flips overlayVisible', () => {
    expect(useGameStore.getState().overlayVisible).toBe(false);
    useGameStore.getState().toggleOverlay();
    expect(useGameStore.getState().overlayVisible).toBe(true);
    useGameStore.getState().toggleOverlay();
    expect(useGameStore.getState().overlayVisible).toBe(false);
  });

  it('setAutoOverlayEnabled updates preference', () => {
    useGameStore.getState().setAutoOverlayEnabled(false);
    expect(useGameStore.getState().autoOverlayEnabled).toBe(false);
  });

  it('setOverlayVisible sets exact value', () => {
    useGameStore.getState().setOverlayVisible(true);
    expect(useGameStore.getState().overlayVisible).toBe(true);
    useGameStore.getState().setOverlayVisible(false);
    expect(useGameStore.getState().overlayVisible).toBe(false);
  });
});
