import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useGameStore } from '../stores/game-store';
import { usePlayerLevelStore } from '../stores/player-level-store';
import type { GameStartPayload, GameEndPayload } from '../shared/types';

export function useGameSessionEvents(): void {
  const setGameState = useGameStore((s) => s.setGameState);
  const resetLevel = usePlayerLevelStore((s) => s.resetLevel);

  useEffect(() => {
    const unlisteners: Array<() => void> = [];

    async function setup() {
      const unlistenStart = await listen<GameStartPayload>('lcu:game-start', () => {
        resetLevel();
      });
      unlisteners.push(unlistenStart);

      const unlistenEnd = await listen<GameEndPayload>('lcu:game-end', () => {
        setGameState(null);
      });
      unlisteners.push(unlistenEnd);
    }

    setup();

    return () => {
      for (const unlisten of unlisteners) {
        unlisten();
      }
    };
  }, [setGameState, resetLevel]);
}
