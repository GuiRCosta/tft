import type { DDragonChampion, DDragonItem, DDragonTrait } from '../types/ddragon';

export function findChampionById(
  champions: readonly DDragonChampion[],
  id: string,
): DDragonChampion | undefined {
  return champions.find((c) => c.id === id);
}

export function findChampionByName(
  champions: readonly DDragonChampion[],
  name: string,
): DDragonChampion | undefined {
  const normalized = name.toLowerCase();
  return champions.find((c) => c.name.toLowerCase() === normalized);
}

export function findItemById(
  items: readonly DDragonItem[],
  id: string,
): DDragonItem | undefined {
  return items.find((i) => i.id === id);
}

export function findTraitById(
  traits: readonly DDragonTrait[],
  id: string,
): DDragonTrait | undefined {
  return traits.find((t) => t.id === id);
}

export function groupChampionsByCost(
  champions: readonly DDragonChampion[],
): ReadonlyMap<number, readonly DDragonChampion[]> {
  const map = new Map<number, DDragonChampion[]>();
  for (const champ of champions) {
    const existing = map.get(champ.cost) ?? [];
    map.set(champ.cost, [...existing, champ]);
  }
  return map;
}

export function buildChampionNameMap(
  champions: readonly DDragonChampion[],
): ReadonlyMap<string, DDragonChampion> {
  return new Map(champions.map((c) => [c.name.toLowerCase(), c]));
}
