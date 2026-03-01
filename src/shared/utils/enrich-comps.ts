import type { DDragonChampion, DDragonItem } from '../types/ddragon';
import type { RawMetaComp } from '../types/meta-comps';
import type { TierRank } from '../types/composition';
import type { OverlayChampion, OverlayCompData, OverlayItem } from './sample-comp';

const VALID_TIERS = new Set<string>(['S', 'A', 'B', 'C', 'D']);

function clampCost(cost: number): 1 | 2 | 3 | 4 | 5 {
  return Math.max(1, Math.min(5, cost)) as 1 | 2 | 3 | 4 | 5;
}

function parseTier(tier: string): TierRank {
  return VALID_TIERS.has(tier) ? (tier as TierRank) : 'C';
}

function buildChampionMap(
  champions: readonly DDragonChampion[],
): ReadonlyMap<string, DDragonChampion> {
  return new Map(champions.map((c) => [c.id, c]));
}

function buildItemMap(
  items: readonly DDragonItem[],
): ReadonlyMap<string, DDragonItem> {
  return new Map(items.map((i) => [i.id, i]));
}

function resolveItems(
  coreItemIds: readonly string[],
  itemMap: ReadonlyMap<string, DDragonItem>,
): readonly OverlayItem[] {
  return coreItemIds
    .map((itemId) => itemMap.get(itemId))
    .filter((item): item is DDragonItem => item !== undefined)
    .map((item) => ({
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
    }));
}

function enrichChampion(
  championId: string,
  championMap: ReadonlyMap<string, DDragonChampion>,
  coreItemIds: readonly string[],
  itemMap: ReadonlyMap<string, DDragonItem>,
): OverlayChampion | null {
  const champ = championMap.get(championId);
  if (!champ) {
    return null;
  }

  const items = resolveItems(coreItemIds, itemMap);

  return {
    id: champ.id,
    name: champ.name,
    cost: clampCost(champ.cost),
    imageUrl: champ.imageUrl,
    owned: false,
    ...(items.length > 0 ? { items } : {}),
  };
}

function enrichSingleComp(
  raw: RawMetaComp,
  championMap: ReadonlyMap<string, DDragonChampion>,
  itemMap: ReadonlyMap<string, DDragonItem>,
): OverlayCompData {
  const champions = raw.champions
    .map((id) => {
      const coreItemIds = raw.coreItems[id] ?? [];
      return enrichChampion(id, championMap, coreItemIds, itemMap);
    })
    .filter((c): c is OverlayChampion => c !== null);

  return {
    source: 'live',
    compName: raw.name,
    tier: parseTier(raw.tier),
    winrate: raw.winrate,
    champions,
  };
}

/**
 * Enriches raw meta comp data with DDragon champion and item information.
 * Filters out comps that have no resolved champions.
 */
export function enrichMetaComps(
  rawComps: readonly RawMetaComp[],
  champions: readonly DDragonChampion[],
  items?: readonly DDragonItem[],
): readonly OverlayCompData[] {
  if (rawComps.length === 0 || champions.length === 0) {
    return [];
  }

  const championMap = buildChampionMap(champions);
  const itemMap = buildItemMap(items ?? []);

  return rawComps
    .map((raw) => enrichSingleComp(raw, championMap, itemMap))
    .filter((comp) => comp.champions.length > 0);
}
