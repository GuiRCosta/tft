import { describe, it, expect } from 'vitest';
import { enrichMetaComps } from './enrich-comps';
import type { DDragonChampion, DDragonItem } from '../types/ddragon';
import type { RawMetaComp } from '../types/meta-comps';

const mockChampions: readonly DDragonChampion[] = [
  { id: 'TFT13_Jinx', name: 'Jinx', cost: 4, imageUrl: '/jinx.png', imageName: 'jinx.png' },
  { id: 'TFT13_Vi', name: 'Vi', cost: 2, imageUrl: '/vi.png', imageName: 'vi.png' },
  { id: 'TFT13_Ekko', name: 'Ekko', cost: 3, imageUrl: '/ekko.png', imageName: 'ekko.png' },
  { id: 'TFT13_Silco', name: 'Silco', cost: 5, imageUrl: '/silco.png', imageName: 'silco.png' },
  { id: 'TFT13_Powder', name: 'Powder', cost: 1, imageUrl: '/powder.png', imageName: 'powder.png' },
];

function makeRawComp(overrides: Partial<RawMetaComp> = {}): RawMetaComp {
  return {
    name: 'Test Comp',
    champions: ['TFT13_Jinx', 'TFT13_Vi', 'TFT13_Ekko'],
    coreItems: {},
    winrate: 55.0,
    avgPlacement: 3.5,
    difficulty: 'medium',
    contested: 20,
    tier: 'A',
    ...overrides,
  };
}

describe('enrichMetaComps', () => {
  it('enriches valid champion IDs with DDragon data', () => {
    const rawComps = [makeRawComp()];
    const result = enrichMetaComps(rawComps, mockChampions);

    expect(result).toHaveLength(1);
    expect(result[0].compName).toBe('Test Comp');
    expect(result[0].tier).toBe('A');
    expect(result[0].winrate).toBe(55.0);
    expect(result[0].champions).toHaveLength(3);
    expect(result[0].champions[0].name).toBe('Jinx');
    expect(result[0].champions[0].imageUrl).toBe('/jinx.png');
  });

  it('filters out unknown champion IDs', () => {
    const rawComps = [makeRawComp({ champions: ['TFT13_Jinx', 'TFT13_Unknown', 'TFT13_Vi'] })];
    const result = enrichMetaComps(rawComps, mockChampions);

    expect(result[0].champions).toHaveLength(2);
    expect(result[0].champions[0].name).toBe('Jinx');
    expect(result[0].champions[1].name).toBe('Vi');
  });

  it('filters out comps where all champions are unknown', () => {
    const rawComps = [makeRawComp({ champions: ['TFT13_X', 'TFT13_Y'] })];
    const result = enrichMetaComps(rawComps, mockChampions);

    expect(result).toHaveLength(0);
  });

  it('returns empty array when rawComps is empty', () => {
    const result = enrichMetaComps([], mockChampions);
    expect(result).toHaveLength(0);
  });

  it('returns empty array when champions is empty', () => {
    const rawComps = [makeRawComp()];
    const result = enrichMetaComps(rawComps, []);
    expect(result).toHaveLength(0);
  });

  it('enriches multiple comps', () => {
    const rawComps = [
      makeRawComp({ name: 'Comp A', tier: 'S' }),
      makeRawComp({ name: 'Comp B', tier: 'B' }),
    ];
    const result = enrichMetaComps(rawComps, mockChampions);

    expect(result).toHaveLength(2);
    expect(result[0].compName).toBe('Comp A');
    expect(result[0].tier).toBe('S');
    expect(result[1].compName).toBe('Comp B');
    expect(result[1].tier).toBe('B');
  });

  it('defaults invalid tier to C', () => {
    const rawComps = [makeRawComp({ tier: 'Z' })];
    const result = enrichMetaComps(rawComps, mockChampions);

    expect(result[0].tier).toBe('C');
  });

  it('clamps champion costs to 1-5 range', () => {
    const champWithHighCost: DDragonChampion = {
      id: 'TFT13_Broken',
      name: 'Broken',
      cost: 10,
      imageUrl: '/broken.png',
      imageName: 'broken.png',
    };
    const rawComps = [makeRawComp({ champions: ['TFT13_Broken'] })];
    const result = enrichMetaComps(rawComps, [...mockChampions, champWithHighCost]);

    expect(result[0].champions[0].cost).toBe(5);
  });

  it('sets source to live for enriched comps', () => {
    const rawComps = [makeRawComp()];
    const result = enrichMetaComps(rawComps, mockChampions);

    expect(result[0].source).toBe('live');
  });

  it('sets owned to false for all champions', () => {
    const rawComps = [makeRawComp()];
    const result = enrichMetaComps(rawComps, mockChampions);

    for (const champ of result[0].champions) {
      expect(champ.owned).toBe(false);
    }
  });

  // --- Item enrichment tests ---

  const mockItems: readonly DDragonItem[] = [
    { id: 'TFT_Item_InfinityEdge', name: 'Infinity Edge', imageUrl: '/ie.png', imageName: 'ie.png' },
    { id: 'TFT_Item_LastWhisper', name: 'Last Whisper', imageUrl: '/lw.png', imageName: 'lw.png' },
    { id: 'TFT_Item_GuinsoosRageblade', name: 'Guinsoos Rageblade', imageUrl: '/gr.png', imageName: 'gr.png' },
  ];

  it('enriches core items with DDragon data', () => {
    const rawComps = [makeRawComp({
      coreItems: { TFT13_Jinx: ['TFT_Item_InfinityEdge', 'TFT_Item_LastWhisper'] },
    })];
    const result = enrichMetaComps(rawComps, mockChampions, mockItems);

    const jinx = result[0].champions.find((c) => c.id === 'TFT13_Jinx');
    expect(jinx?.items).toHaveLength(2);
    expect(jinx?.items?.[0].name).toBe('Infinity Edge');
    expect(jinx?.items?.[0].imageUrl).toBe('/ie.png');
    expect(jinx?.items?.[1].name).toBe('Last Whisper');
  });

  it('ignores unknown item IDs', () => {
    const rawComps = [makeRawComp({
      coreItems: { TFT13_Jinx: ['TFT_Item_InfinityEdge', 'TFT_Item_Unknown'] },
    })];
    const result = enrichMetaComps(rawComps, mockChampions, mockItems);

    const jinx = result[0].champions.find((c) => c.id === 'TFT13_Jinx');
    expect(jinx?.items).toHaveLength(1);
    expect(jinx?.items?.[0].name).toBe('Infinity Edge');
  });

  it('champions without core items have no items field', () => {
    const rawComps = [makeRawComp({
      coreItems: { TFT13_Jinx: ['TFT_Item_InfinityEdge'] },
    })];
    const result = enrichMetaComps(rawComps, mockChampions, mockItems);

    const vi = result[0].champions.find((c) => c.id === 'TFT13_Vi');
    expect(vi?.items).toBeUndefined();
  });

  it('works without items parameter (backward compat)', () => {
    const rawComps = [makeRawComp({
      coreItems: { TFT13_Jinx: ['TFT_Item_InfinityEdge'] },
    })];
    const result = enrichMetaComps(rawComps, mockChampions);

    const jinx = result[0].champions.find((c) => c.id === 'TFT13_Jinx');
    expect(jinx?.items).toBeUndefined();
    expect(result[0].champions).toHaveLength(3);
  });

  it('resolves multiple items per champion', () => {
    const rawComps = [makeRawComp({
      coreItems: {
        TFT13_Jinx: ['TFT_Item_InfinityEdge', 'TFT_Item_LastWhisper', 'TFT_Item_GuinsoosRageblade'],
      },
    })];
    const result = enrichMetaComps(rawComps, mockChampions, mockItems);

    const jinx = result[0].champions.find((c) => c.id === 'TFT13_Jinx');
    expect(jinx?.items).toHaveLength(3);
  });

  it('does not set items when DDragon items array is empty', () => {
    const rawComps = [makeRawComp({
      coreItems: { TFT13_Jinx: ['TFT_Item_InfinityEdge'] },
    })];
    const result = enrichMetaComps(rawComps, mockChampions, []);

    const jinx = result[0].champions.find((c) => c.id === 'TFT13_Jinx');
    expect(jinx?.items).toBeUndefined();
  });
});
