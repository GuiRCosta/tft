import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithI18n } from '../../test-utils';
import { RollOdds } from './RollOdds';

describe('RollOdds', () => {
  it('renders all 5 cost labels', () => {
    renderWithI18n(<RollOdds currentLevel={5} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders correct odds for level 5', () => {
    renderWithI18n(<RollOdds currentLevel={5} />);
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('33%')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText('2%')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders correct odds for level 1 (100% cost-1)', () => {
    renderWithI18n(<RollOdds currentLevel={1} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
    const zeros = screen.getAllByText('0%');
    expect(zeros.length).toBe(4);
  });

  it('falls back to level 1 odds for invalid level', () => {
    renderWithI18n(<RollOdds currentLevel={99} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
