import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithI18n } from '../../test-utils';
import { GoldTracker } from './GoldTracker';

describe('GoldTracker', () => {
  it('renders gold amount', () => {
    renderWithI18n(<GoldTracker gold={50} level={5} xp={10} xpToNext={20} />);
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('renders level', () => {
    renderWithI18n(<GoldTracker gold={30} level={7} xp={20} xpToNext={48} />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders XP progress', () => {
    renderWithI18n(<GoldTracker gold={30} level={5} xp={10} xpToNext={20} />);
    expect(screen.getByText(/10.*20/)).toBeInTheDocument();
  });

  it('renders XP bar with correct width', () => {
    const { container } = renderWithI18n(
      <GoldTracker gold={30} level={5} xp={15} xpToNext={30} />,
    );
    const bars = container.querySelectorAll('[class*="rounded-full"]');
    const innerBar = Array.from(bars).find(
      (el) => (el as HTMLElement).style.width !== '',
    ) as HTMLElement;
    expect(innerBar?.style.width).toBe('50%');
  });

  it('handles xpToNext = 0 without errors', () => {
    renderWithI18n(<GoldTracker gold={99} level={10} xp={0} xpToNext={0} />);
    expect(screen.getByText('99')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
