import type { Champion, Item } from './champion';

export interface PlayerState {
  readonly level: number;
  readonly gold: number;
  readonly xp: number;
  readonly xpToNext: number;
  readonly health: number;
  readonly streak: number;
}

export interface BoardState {
  readonly champions: readonly Champion[];
  readonly bench: readonly Champion[];
  readonly items: readonly Item[];
}

export interface OpponentInfo {
  readonly summonerName: string;
  readonly health: number;
  readonly level: number;
  readonly champions: readonly Champion[];
  readonly traits: readonly ActiveTrait[];
}

export interface ActiveTrait {
  readonly name: string;
  readonly numUnits: number;
  readonly style: number;
}

export type GamePhase = 'planning' | 'combat' | 'carousel';

export interface TFTGameState {
  readonly player: PlayerState;
  readonly board: BoardState;
  readonly opponents: readonly OpponentInfo[];
  readonly stage: string;
  readonly round: number;
  readonly phase: GamePhase;
}
