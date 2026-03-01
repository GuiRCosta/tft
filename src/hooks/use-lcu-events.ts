import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { useGameStore, shouldShowOverlay } from '../stores/game-store';
import type { ConnectionStatusPayload, GameflowPayload } from '../shared/types/lcu-events';

export function useLcuEvents(): void {
  const setConnectionStatus = useGameStore((s) => s.setConnectionStatus);
  const setSummonerName = useGameStore((s) => s.setSummonerName);
  const setGameflowPhase = useGameStore((s) => s.setGameflowPhase);
  const setIsTft = useGameStore((s) => s.setIsTft);
  const setIsInGame = useGameStore((s) => s.setIsInGame);

  useEffect(() => {
    const unlisteners: Array<() => void> = [];

    async function setupListeners() {
      const unlistenConnection = await listen<ConnectionStatusPayload>(
        'lcu:connection-status',
        (event) => {
          setConnectionStatus(event.payload.status);
          setSummonerName(event.payload.summonerName);
        },
      );
      unlisteners.push(unlistenConnection);

      const unlistenGameflow = await listen<GameflowPayload>(
        'lcu:gameflow-update',
        (event) => {
          const { phase, isTft } = event.payload;
          setGameflowPhase(phase);
          setIsTft(isTft);
          setIsInGame(shouldShowOverlay(phase, isTft));
        },
      );
      unlisteners.push(unlistenGameflow);
    }

    setupListeners();

    return () => {
      unlisteners.forEach((fn) => fn());
    };
  }, [setConnectionStatus, setSummonerName, setGameflowPhase, setIsTft, setIsInGame]);
}
