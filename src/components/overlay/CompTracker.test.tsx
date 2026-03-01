import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithI18n } from '../../test-utils';
import { CompTracker } from './CompTracker';
import type { OverlayChampion } from '../../shared/utils/sample-comp';

const MOCK_CHAMPS: readonly OverlayChampion[] = [
  { id: '1', name: 'Ahri', cost: 4, imageUrl: '/ahri.png', owned: true },
  { id: '2', name: 'Jinx', cost: 3, imageUrl: '/jinx.png', owned: false },
];

describe('CompTracker', () => {
  it('renders comp name', () => {
    renderWithI18n(
      <CompTracker compName="Rebel Comp" tier="S" winrate={65} champions={MOCK_CHAMPS} />,
    );
    expect(screen.getByText('Rebel Comp')).toBeInTheDocument();
  });

  it('renders tier badge', () => {
    renderWithI18n(
      <CompTracker compName="Test" tier="A" winrate={55} champions={MOCK_CHAMPS} />,
    );
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders winrate when > 0', () => {
    renderWithI18n(
      <CompTracker compName="Test" tier="B" winrate={60} champions={MOCK_CHAMPS} />,
    );
    expect(screen.getByText(/60.*WR/)).toBeInTheDocument();
  });

  it('hides winrate when 0', () => {
    renderWithI18n(
      <CompTracker compName="Test" tier="B" winrate={0} champions={MOCK_CHAMPS} />,
    );
    expect(screen.queryByText(/WR/)).not.toBeInTheDocument();
  });

  it('renders champion names', () => {
    renderWithI18n(
      <CompTracker compName="Test" tier="B" winrate={0} champions={MOCK_CHAMPS} />,
    );
    expect(screen.getByText('Ahri')).toBeInTheDocument();
    expect(screen.getByText('Jinx')).toBeInTheDocument();
  });

  it('shows Preview badge when source is preview', () => {
    renderWithI18n(
      <CompTracker
        compName="Test"
        tier="B"
        winrate={0}
        champions={MOCK_CHAMPS}
        source="preview"
      />,
    );
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('does not show Preview badge when source is live', () => {
    renderWithI18n(
      <CompTracker
        compName="Test"
        tier="B"
        winrate={0}
        champions={MOCK_CHAMPS}
        source="live"
      />,
    );
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
  });

  it('does not show Preview badge when source is undefined', () => {
    renderWithI18n(
      <CompTracker compName="Test" tier="B" winrate={0} champions={MOCK_CHAMPS} />,
    );
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
  });

  it('renders item icons for champions with items', () => {
    const champsWithItems: readonly OverlayChampion[] = [
      {
        id: '1',
        name: 'Jinx',
        cost: 4,
        imageUrl: '/jinx.png',
        owned: false,
        items: [
          { id: 'ie', name: 'Infinity Edge', imageUrl: '/ie.png' },
          { id: 'lw', name: 'Last Whisper', imageUrl: '/lw.png' },
        ],
      },
    ];
    renderWithI18n(
      <CompTracker compName="Test" tier="S" winrate={60} champions={champsWithItems} />,
    );
    expect(screen.getByAltText('Infinity Edge')).toBeInTheDocument();
    expect(screen.getByAltText('Last Whisper')).toBeInTheDocument();
  });

  it('does not render item icons when items is undefined', () => {
    renderWithI18n(
      <CompTracker compName="Test" tier="B" winrate={0} champions={MOCK_CHAMPS} />,
    );
    expect(screen.queryByAltText('Infinity Edge')).not.toBeInTheDocument();
  });
});
