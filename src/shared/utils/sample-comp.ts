import type { DDragonChampion } from '../types/ddragon';
import type { TierRank } from '../types/composition';

export interface OverlayItem {
  readonly id: string;
  readonly name: string;
  readonly imageUrl: string;
}

export interface OverlayChampion {
  readonly id: string;
  readonly name: string;
  readonly cost: 1 | 2 | 3 | 4 | 5;
  readonly imageUrl: string;
  readonly owned: boolean;
  readonly items?: readonly OverlayItem[];
}

export interface OverlayCompData {
  readonly source: 'preview' | 'live';
  readonly compName: string;
  readonly tier: TierRank;
  readonly winrate: number;
  readonly champions: readonly OverlayChampion[];
}

/** How many champions to pick per cost tier: [cost1, cost2, cost3, cost4, cost5] */
const SAMPLE_COST_DISTRIBUTION: readonly number[] = [2, 2, 2, 1, 1];

/**
 * Builds a deterministic sample comp from real DDragon champions.
 * Picks the first N champions per cost tier in alphabetical order.
 */
export function buildSampleComp(champions: readonly DDragonChampion[]): OverlayCompData {
  const byCost = groupByCostSorted(champions);

  const selected = SAMPLE_COST_DISTRIBUTION.flatMap((count, index) => {
    const cost = index + 1;
    const bucket = byCost.get(cost) ?? [];
    return bucket.slice(0, count);
  });

  return {
    source: 'preview',
    compName: 'Sample Comp',
    tier: 'B',
    winrate: 0,
    champions: selected.map((champ) => ({
      id: champ.id,
      name: champ.name,
      cost: clampCost(champ.cost),
      imageUrl: champ.imageUrl,
      owned: false,
    })),
  };
}

function clampCost(cost: number): 1 | 2 | 3 | 4 | 5 {
  return Math.max(1, Math.min(5, cost)) as 1 | 2 | 3 | 4 | 5;
}

function groupByCostSorted(
  champions: readonly DDragonChampion[],
): ReadonlyMap<number, readonly DDragonChampion[]> {
  const map = new Map<number, DDragonChampion[]>();

  for (const champ of champions) {
    const existing = map.get(champ.cost) ?? [];
    map.set(champ.cost, [...existing, champ]);
  }

  const sorted = new Map<number, readonly DDragonChampion[]>();
  for (const [cost, champs] of map) {
    sorted.set(
      cost,
      [...champs].sort((a, b) => a.name.localeCompare(b.name)),
    );
  }

  return sorted;
}
