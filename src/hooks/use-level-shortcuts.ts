import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { usePlayerLevelStore } from '../stores/player-level-store';

export function useLevelShortcuts(): void {
  const incrementLevel = usePlayerLevelStore((s) => s.incrementLevel);
  const decrementLevel = usePlayerLevelStore((s) => s.decrementLevel);

  useEffect(() => {
    const unlisteners: Array<() => void> = [];

    async function setup() {
      const unlisten1 = await listen('player:level-increment', () => {
        incrementLevel();
      });
      unlisteners.push(unlisten1);

      const unlisten2 = await listen('player:level-decrement', () => {
        decrementLevel();
      });
      unlisteners.push(unlisten2);
    }

    setup();

    return () => {
      for (const unlisten of unlisteners) {
        unlisten();
      }
    };
  }, [incrementLevel, decrementLevel]);
}
