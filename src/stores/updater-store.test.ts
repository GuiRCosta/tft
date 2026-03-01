import { describe, it, expect, beforeEach } from 'vitest';
import { useUpdaterStore } from './updater-store';

describe('updater-store', () => {
  beforeEach(() => {
    useUpdaterStore.getState().reset();
  });

  it('starts with idle status', () => {
    const state = useUpdaterStore.getState();
    expect(state.status).toBe('idle');
    expect(state.updateInfo).toBeNull();
    expect(state.errorMessage).toBeNull();
  });

  it('sets status', () => {
    useUpdaterStore.getState().setStatus('checking');
    expect(useUpdaterStore.getState().status).toBe('checking');
  });

  it('sets update info', () => {
    const info = { version: '1.0.0', notes: 'fix', date: '2026-01-01' };
    useUpdaterStore.getState().setUpdateInfo(info);
    expect(useUpdaterStore.getState().updateInfo).toEqual(info);
  });

  it('sets error message', () => {
    useUpdaterStore.getState().setErrorMessage('network error');
    expect(useUpdaterStore.getState().errorMessage).toBe('network error');
  });

  it('resets to initial state', () => {
    useUpdaterStore.getState().setStatus('available');
    useUpdaterStore.getState().setUpdateInfo({ version: '2.0.0', notes: '', date: '' });
    useUpdaterStore.getState().setErrorMessage('err');

    useUpdaterStore.getState().reset();
    const state = useUpdaterStore.getState();
    expect(state.status).toBe('idle');
    expect(state.updateInfo).toBeNull();
    expect(state.errorMessage).toBeNull();
  });
});
