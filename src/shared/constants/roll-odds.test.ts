import { describe, it, expect } from 'vitest';
import { ROLL_ODDS, CHAMPION_POOL } from './roll-odds';

describe('ROLL_ODDS', () => {
  it('has entries for levels 1 through 10', () => {
    for (let level = 1; level <= 10; level++) {
      expect(ROLL_ODDS[level]).toBeDefined();
    }
  });

  it('each level has exactly 5 odds (one per cost tier)', () => {
    for (let level = 1; level <= 10; level++) {
      expect(ROLL_ODDS[level].length).toBe(5);
    }
  });

  it('odds sum to 100 for each level', () => {
    for (let level = 1; level <= 10; level++) {
      const sum = ROLL_ODDS[level].reduce((a, b) => a + b, 0);
      expect(sum).toBe(100);
    }
  });

  it('all odds are non-negative', () => {
    for (let level = 1; level <= 10; level++) {
      for (const odd of ROLL_ODDS[level]) {
        expect(odd).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('level 1 is 100% cost-1', () => {
    expect(ROLL_ODDS[1]).toEqual([100, 0, 0, 0, 0]);
  });

  it('cost-5 odds are 0 at low levels (1-6)', () => {
    for (let level = 1; level <= 6; level++) {
      expect(ROLL_ODDS[level][4]).toBe(0);
    }
  });

  it('cost-5 odds appear at level 7+', () => {
    for (let level = 7; level <= 10; level++) {
      expect(ROLL_ODDS[level][4]).toBeGreaterThan(0);
    }
  });
});

describe('CHAMPION_POOL', () => {
  it('has entries for costs 1 through 5', () => {
    for (let cost = 1; cost <= 5; cost++) {
      expect(CHAMPION_POOL[cost]).toBeDefined();
      expect(CHAMPION_POOL[cost]).toBeGreaterThan(0);
    }
  });

  it('pool size decreases as cost increases', () => {
    for (let cost = 2; cost <= 5; cost++) {
      expect(CHAMPION_POOL[cost]).toBeLessThanOrEqual(CHAMPION_POOL[cost - 1]);
    }
  });
});
