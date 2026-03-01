import { describe, it, expect, beforeEach } from 'vitest';
import { usePlayerLevelStore } from './player-level-store';

describe('usePlayerLevelStore', () => {
  beforeEach(() => {
    usePlayerLevelStore.setState({ level: 1 });
  });

  it('starts at level 1', () => {
    expect(usePlayerLevelStore.getState().level).toBe(1);
  });

  it('incrementLevel increases level by 1', () => {
    usePlayerLevelStore.getState().incrementLevel();
    expect(usePlayerLevelStore.getState().level).toBe(2);
  });

  it('incrementLevel clamps at MAX_LEVEL (10)', () => {
    usePlayerLevelStore.setState({ level: 10 });
    usePlayerLevelStore.getState().incrementLevel();
    expect(usePlayerLevelStore.getState().level).toBe(10);
  });

  it('decrementLevel decreases level by 1', () => {
    usePlayerLevelStore.setState({ level: 5 });
    usePlayerLevelStore.getState().decrementLevel();
    expect(usePlayerLevelStore.getState().level).toBe(4);
  });

  it('decrementLevel clamps at MIN_LEVEL (1)', () => {
    usePlayerLevelStore.setState({ level: 1 });
    usePlayerLevelStore.getState().decrementLevel();
    expect(usePlayerLevelStore.getState().level).toBe(1);
  });

  it('resetLevel sets level back to 1', () => {
    usePlayerLevelStore.setState({ level: 8 });
    usePlayerLevelStore.getState().resetLevel();
    expect(usePlayerLevelStore.getState().level).toBe(1);
  });

  it('can increment from 1 to 10 sequentially', () => {
    for (let i = 1; i < 10; i++) {
      usePlayerLevelStore.getState().incrementLevel();
    }
    expect(usePlayerLevelStore.getState().level).toBe(10);
  });

  it('multiple increments beyond max stay at 10', () => {
    usePlayerLevelStore.setState({ level: 9 });
    usePlayerLevelStore.getState().incrementLevel();
    usePlayerLevelStore.getState().incrementLevel();
    usePlayerLevelStore.getState().incrementLevel();
    expect(usePlayerLevelStore.getState().level).toBe(10);
  });
});
