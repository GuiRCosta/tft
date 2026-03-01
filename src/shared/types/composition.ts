export type CompDifficulty = 'easy' | 'medium' | 'hard';
export type TierRank = 'S' | 'A' | 'B' | 'C' | 'D';

export interface CompRecommendation {
  readonly name: string;
  readonly champions: readonly string[];
  readonly coreItems: Readonly<Record<string, readonly [string, string]>>;
  readonly winrate: number;
  readonly avgPlacement: number;
  readonly difficulty: CompDifficulty;
  readonly contested: number;
  readonly tier: TierRank;
  readonly fitScore?: number;
}
