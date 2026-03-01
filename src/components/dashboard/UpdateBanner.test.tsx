import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithI18n } from '../../test-utils';
import { useUpdaterStore } from '../../stores/updater-store';

vi.mock('../../hooks/use-updater', () => ({
  useUpdater: () => {
    const store = useUpdaterStore.getState();
    return {
      status: store.status,
      updateInfo: store.updateInfo,
      errorMessage: store.errorMessage,
      hasUpdate: store.status === 'available',
      checkForUpdates: vi.fn(),
      installUpdate: vi.fn(),
    };
  },
}));

import { UpdateBanner } from './UpdateBanner';

describe('UpdateBanner', () => {
  beforeEach(() => {
    useUpdaterStore.getState().reset();
  });

  it('does not render when status is idle', () => {
    const { container } = renderWithI18n(<UpdateBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders when update is available', () => {
    useUpdaterStore.setState({
      status: 'available',
      updateInfo: { version: '1.2.0', notes: '', date: '' },
    });

    renderWithI18n(<UpdateBanner />);
    expect(screen.getByText(/1\.2\.0/)).toBeInTheDocument();
  });

  it('shows correct version in the banner', () => {
    useUpdaterStore.setState({
      status: 'available',
      updateInfo: { version: '2.0.0', notes: '', date: '' },
    });

    renderWithI18n(<UpdateBanner />);
    expect(screen.getByText(/2\.0\.0/)).toBeInTheDocument();
  });

  it('shows disabled button when downloading', () => {
    useUpdaterStore.setState({
      status: 'downloading',
      updateInfo: { version: '1.2.0', notes: '', date: '' },
    });

    renderWithI18n(<UpdateBanner />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
