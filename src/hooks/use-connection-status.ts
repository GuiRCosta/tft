import { useGameStore } from '../stores/game-store';

export function useConnectionStatus() {
  const connectionStatus = useGameStore((s) => s.connectionStatus);
  const summonerName = useGameStore((s) => s.summonerName);

  return {
    connectionStatus,
    summonerName,
    isConnected: connectionStatus === 'connected',
    isDisconnected: connectionStatus === 'disconnected',
    isConnecting: connectionStatus === 'connecting',
  } as const;
}
