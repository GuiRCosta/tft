import { describe, it, expect } from 'vitest';
import type { DDragonChampion } from '../types/ddragon';
import { buildSampleComp } from './sample-comp';

function makeChampion(name: string, cost: number): DDragonChampion {
  return {
    id: `TFT13_${name}`,
    name,
    cost,
    imageUrl: `/${name.toLowerCase()}.png`,
    imageName: `${name.toLowerCase()}.png`,
  };
}

const MOCK_CHAMPIONS: readonly DDragonChampion[] = [
  makeChampion('Ziggs', 1),
  makeChampion('Vi', 1),
  makeChampion('Annie', 1),
  makeChampion('Jinx', 3),
  makeChampion('Ekko', 3),
  makeChampion('Caitlyn', 3),
  makeChampion('Lux', 2),
  makeChampion('Darius', 2),
  makeChampion('Zed', 2),
  makeChampion('Ahri', 4),
  makeChampion('Kaisa', 4),
  makeChampion('Senna', 5),
  makeChampion('Akali', 5),
];

describe('buildSampleComp', () => {
  it('returns source as preview', () => {
    const comp = buildSampleComp(MOCK_CHAMPIONS);
    expect(comp.source).toBe('preview');
  });

  it('returns tier B and winrate 0', () => {
    const comp = buildSampleComp(MOCK_CHAMPIONS);
    expect(comp.tier).toBe('B');
    expect(comp.winrate).toBe(0);
  });

  it('picks correct count per cost tier: 2+2+2+1+1 = 8', () => {
    const comp = buildSampleComp(MOCK_CHAMPIONS);
    expect(comp.champions.length).toBe(8);
  });

  it('picks 2 cost-1 champions alphabetically', () => {
    const comp = buildSampleComp(MOCK_CHAMPIONS);
    const cost1 = comp.champions.filter((c) => c.cost === 1);
    expect(cost1.length).toBe(2);
    expect(cost1[0].name).toBe('Annie');
    expect(cost1[1].name).toBe('Vi');
  });

  it('picks 2 cost-2 champions alphabetically', () => {
    const comp = buildSampleComp(MOCK_CHAMPIONS);
    const cost2 = comp.champions.filter((c) => c.cost === 2);
    expect(cost2.length).toBe(2);
    expect(cost2[0].name).toBe('Darius');
    expect(cost2[1].name).toBe('Lux');
  });

  it('picks 2 cost-3 champions alphabetically', () => {
    const comp = buildSampleComp(MOCK_CHAMPIONS);
    const cost3 = comp.champions.filter((c) => c.cost === 3);
    expect(cost3.length).toBe(2);
    expect(cost3[0].name).toBe('Caitlyn');
    expect(cost3[1].name).toBe('Ekko');
  });

  it('picks 1 cost-4 champion', () => {
    const comp = buildSampleComp(MOCK_CHAMPIONS);
    const cost4 = comp.champions.filter((c) => c.cost === 4);
    expect(cost4.length).toBe(1);
    expect(cost4[0].name).toBe('Ahri');
  });

  it('picks 1 cost-5 champion', () => {
    const comp = buildSampleComp(MOCK_CHAMPIONS);
    const cost5 = comp.champions.filter((c) => c.cost === 5);
    expect(cost5.length).toBe(1);
    expect(cost5[0].name).toBe('Akali');
  });

  it('all champions have owned: false', () => {
    const comp = buildSampleComp(MOCK_CHAMPIONS);
    expect(comp.champions.every((c) => c.owned === false)).toBe(true);
  });

  it('handles empty champions array gracefully', () => {
    const comp = buildSampleComp([]);
    expect(comp.champions.length).toBe(0);
    expect(comp.source).toBe('preview');
  });

  it('handles missing cost tiers gracefully', () => {
    const onlyCost1 = [makeChampion('Vi', 1), makeChampion('Ziggs', 1)];
    const comp = buildSampleComp(onlyCost1);
    expect(comp.champions.length).toBe(2);
    expect(comp.champions.every((c) => c.cost === 1)).toBe(true);
  });

  it('clamps cost to 1-5 range', () => {
    const weirdCost = [makeChampion('Weird', 0), makeChampion('Also', 7)];
    const comp = buildSampleComp(weirdCost);
    for (const champ of comp.champions) {
      expect(champ.cost).toBeGreaterThanOrEqual(1);
      expect(champ.cost).toBeLessThanOrEqual(5);
    }
  });

  it('is deterministic — same input produces same output', () => {
    const a = buildSampleComp(MOCK_CHAMPIONS);
    const b = buildSampleComp(MOCK_CHAMPIONS);
    expect(a.champions.map((c) => c.id)).toEqual(b.champions.map((c) => c.id));
  });
});
