import { describe, it, expect } from 'vitest';
import { XP_TO_NEXT_LEVEL, MIN_LEVEL, MAX_LEVEL } from './xp-table';

describe('xp-table', () => {
  it('MIN_LEVEL is 1', () => {
    expect(MIN_LEVEL).toBe(1);
  });

  it('MAX_LEVEL is 10', () => {
    expect(MAX_LEVEL).toBe(10);
  });

  it('has XP entries for levels 1 through 9', () => {
    for (let level = 1; level <= 9; level++) {
      expect(XP_TO_NEXT_LEVEL[level]).toBeDefined();
      expect(XP_TO_NEXT_LEVEL[level]).toBeGreaterThan(0);
    }
  });

  it('does not have XP entry for level 10 (max level)', () => {
    expect(XP_TO_NEXT_LEVEL[10]).toBeUndefined();
  });

  it('XP requirements increase as level increases', () => {
    for (let level = 2; level <= 9; level++) {
      expect(XP_TO_NEXT_LEVEL[level]).toBeGreaterThanOrEqual(XP_TO_NEXT_LEVEL[level - 1]);
    }
  });

  it('has specific known values', () => {
    expect(XP_TO_NEXT_LEVEL[1]).toBe(2);
    expect(XP_TO_NEXT_LEVEL[5]).toBe(20);
    expect(XP_TO_NEXT_LEVEL[9]).toBe(84);
  });
});
