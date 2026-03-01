import { describe, it, expect } from 'vitest';
import type { DDragonChampion, DDragonItem, DDragonTrait } from '../types/ddragon';
import {
  findChampionById,
  findChampionByName,
  findItemById,
  findTraitById,
  groupChampionsByCost,
  buildChampionNameMap,
} from './ddragon-lookup';

const MOCK_CHAMPIONS: readonly DDragonChampion[] = [
  { id: 'TFT13_Ahri', name: 'Ahri', cost: 4, imageUrl: '/ahri.png', imageName: 'ahri.png' },
  { id: 'TFT13_Jinx', name: 'Jinx', cost: 3, imageUrl: '/jinx.png', imageName: 'jinx.png' },
  { id: 'TFT13_Ziggs', name: 'Ziggs', cost: 1, imageUrl: '/ziggs.png', imageName: 'ziggs.png' },
  { id: 'TFT13_Vi', name: 'Vi', cost: 1, imageUrl: '/vi.png', imageName: 'vi.png' },
];

const MOCK_ITEMS: readonly DDragonItem[] = [
  { id: 'TFT_Item_BFSword', name: 'B.F. Sword', imageUrl: '/bf.png', imageName: 'bf.png' },
  { id: 'TFT_Item_ChainVest', name: 'Chain Vest', imageUrl: '/cv.png', imageName: 'cv.png' },
];

const MOCK_TRAITS: readonly DDragonTrait[] = [
  { id: 'Set13_Arcana', name: 'Arcana', imageUrl: '/arcana.png', imageName: 'arcana.png' },
  { id: 'Set13_Rebel', name: 'Rebel', imageUrl: '/rebel.png', imageName: 'rebel.png' },
];

describe('findChampionById', () => {
  it('returns champion when id matches', () => {
    const result = findChampionById(MOCK_CHAMPIONS, 'TFT13_Jinx');
    expect(result).toBeDefined();
    expect(result?.name).toBe('Jinx');
  });

  it('returns undefined for non-existent id', () => {
    expect(findChampionById(MOCK_CHAMPIONS, 'TFT13_Unknown')).toBeUndefined();
  });

  it('returns undefined for empty array', () => {
    expect(findChampionById([], 'TFT13_Ahri')).toBeUndefined();
  });
});

describe('findChampionByName', () => {
  it('returns champion when name matches exactly', () => {
    const result = findChampionByName(MOCK_CHAMPIONS, 'Ahri');
    expect(result?.id).toBe('TFT13_Ahri');
  });

  it('is case-insensitive', () => {
    expect(findChampionByName(MOCK_CHAMPIONS, 'ahri')?.id).toBe('TFT13_Ahri');
    expect(findChampionByName(MOCK_CHAMPIONS, 'JINX')?.id).toBe('TFT13_Jinx');
  });

  it('returns undefined for non-existent name', () => {
    expect(findChampionByName(MOCK_CHAMPIONS, 'Teemo')).toBeUndefined();
  });
});

describe('findItemById', () => {
  it('returns item when id matches', () => {
    const result = findItemById(MOCK_ITEMS, 'TFT_Item_BFSword');
    expect(result?.name).toBe('B.F. Sword');
  });

  it('returns undefined for non-existent id', () => {
    expect(findItemById(MOCK_ITEMS, 'TFT_Item_Nope')).toBeUndefined();
  });
});

describe('findTraitById', () => {
  it('returns trait when id matches', () => {
    const result = findTraitById(MOCK_TRAITS, 'Set13_Rebel');
    expect(result?.name).toBe('Rebel');
  });

  it('returns undefined for non-existent id', () => {
    expect(findTraitById(MOCK_TRAITS, 'Set13_Nope')).toBeUndefined();
  });
});

describe('groupChampionsByCost', () => {
  it('groups champions by cost', () => {
    const grouped = groupChampionsByCost(MOCK_CHAMPIONS);
    expect(grouped.get(1)?.length).toBe(2);
    expect(grouped.get(3)?.length).toBe(1);
    expect(grouped.get(4)?.length).toBe(1);
    expect(grouped.get(5)).toBeUndefined();
  });

  it('returns empty map for empty array', () => {
    const grouped = groupChampionsByCost([]);
    expect(grouped.size).toBe(0);
  });
});

describe('buildChampionNameMap', () => {
  it('builds lowercase name map', () => {
    const map = buildChampionNameMap(MOCK_CHAMPIONS);
    expect(map.get('ahri')?.id).toBe('TFT13_Ahri');
    expect(map.get('jinx')?.id).toBe('TFT13_Jinx');
  });

  it('uses lowercase keys', () => {
    const map = buildChampionNameMap(MOCK_CHAMPIONS);
    expect(map.has('Ahri')).toBe(false);
    expect(map.has('ahri')).toBe(true);
  });

  it('returns empty map for empty array', () => {
    const map = buildChampionNameMap([]);
    expect(map.size).toBe(0);
  });
});
