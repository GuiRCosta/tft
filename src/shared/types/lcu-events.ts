export interface ConnectionStatusPayload {
  readonly status: 'disconnected' | 'connecting' | 'connected';
  readonly summonerName: string | null;
  readonly port: number | null;
}

export interface GameflowPayload {
  readonly phase: string;
  readonly isTft: boolean;
  readonly queueId: number | null;
}

export interface LcuErrorPayload {
  readonly message: string;
  readonly recoverable: boolean;
}

export interface GameStartPayload {
  readonly gameId: number | null;
  readonly queueId: number | null;
}

export interface GameEndPayload {
  readonly gameId: number | null;
}

export interface GameSessionPayload {
  readonly gameId: number | null;
  readonly queueId: number | null;
  readonly gameStartTime: number | null;
  readonly isTft: boolean;
}
