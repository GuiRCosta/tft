import { describe, it, expect, beforeEach } from 'vitest';
import { useMetaCompsStore } from './meta-comps-store';
import type { RawMetaComp } from '../shared/types/meta-comps';

describe('meta-comps-store', () => {
  beforeEach(() => {
    useMetaCompsStore.setState({
      status: 'idle',
      version: null,
      patch: null,
      comps: [],
      error: null,
    });
  });

  it('has correct default state', () => {
    const state = useMetaCompsStore.getState();
    expect(state.status).toBe('idle');
    expect(state.version).toBeNull();
    expect(state.patch).toBeNull();
    expect(state.comps).toEqual([]);
    expect(state.error).toBeNull();
  });

  it('setStatus updates status', () => {
    useMetaCompsStore.getState().setStatus('loaded');
    expect(useMetaCompsStore.getState().status).toBe('loaded');
  });

  it('setVersion updates version', () => {
    useMetaCompsStore.getState().setVersion('2026-03-01');
    expect(useMetaCompsStore.getState().version).toBe('2026-03-01');
  });

  it('setPatch updates patch', () => {
    useMetaCompsStore.getState().setPatch('14.5');
    expect(useMetaCompsStore.getState().patch).toBe('14.5');
  });

  it('setComps updates comps', () => {
    const mockComps: readonly RawMetaComp[] = [
      {
        name: 'Test Comp',
        champions: ['TFT13_Jinx'],
        coreItems: {},
        winrate: 55.0,
        avgPlacement: 3.5,
        difficulty: 'medium',
        contested: 20,
        tier: 'A',
      },
    ];
    useMetaCompsStore.getState().setComps(mockComps);
    expect(useMetaCompsStore.getState().comps).toHaveLength(1);
    expect(useMetaCompsStore.getState().comps[0].name).toBe('Test Comp');
  });

  it('setError updates error', () => {
    useMetaCompsStore.getState().setError('fetch failed');
    expect(useMetaCompsStore.getState().error).toBe('fetch failed');
  });

  it('setError can clear error', () => {
    useMetaCompsStore.getState().setError('some error');
    useMetaCompsStore.getState().setError(null);
    expect(useMetaCompsStore.getState().error).toBeNull();
  });
});
