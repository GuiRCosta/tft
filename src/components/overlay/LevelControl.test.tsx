import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithI18n } from '../../test-utils';
import { LevelControl } from './LevelControl';

describe('LevelControl', () => {
  it('renders the level number', () => {
    renderWithI18n(<LevelControl level={7} xpToNext={48} />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders xpToNext when greater than 0', () => {
    renderWithI18n(<LevelControl level={5} xpToNext={20} />);
    expect(screen.getByText(/20/)).toBeInTheDocument();
  });

  it('hides xpToNext when 0 (max level)', () => {
    renderWithI18n(<LevelControl level={10} xpToNext={0} />);
    expect(screen.queryByText(/XP/)).not.toBeInTheDocument();
  });

  it('renders shortcut hint', () => {
    renderWithI18n(<LevelControl level={3} xpToNext={6} />);
    expect(screen.getByText(/\[.*\]/)).toBeInTheDocument();
  });
});
