import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithI18n } from '../../test-utils';
import { TierList } from './TierList';
import type { OverlayCompData } from '../../shared/utils/sample-comp';

const mockComps: readonly OverlayCompData[] = [
  {
    source: 'live',
    compName: 'Rebel Blasters',
    tier: 'S',
    winrate: 62.5,
    champions: [
      { id: 'TFT13_Jinx', name: 'Jinx', cost: 4, imageUrl: '/jinx.png', owned: false },
      { id: 'TFT13_Vi', name: 'Vi', cost: 2, imageUrl: '/vi.png', owned: false },
    ],
  },
  {
    source: 'live',
    compName: 'Enforcers',
    tier: 'A',
    winrate: 58.1,
    champions: [
      { id: 'TFT13_Caitlyn', name: 'Caitlyn', cost: 1, imageUrl: '/caitlyn.png', owned: false },
    ],
  },
];

describe('TierList', () => {
  it('renders multiple comp names', () => {
    renderWithI18n(<TierList comps={mockComps} source="live" />);
    expect(screen.getByText('Rebel Blasters')).toBeInTheDocument();
    expect(screen.getByText('Enforcers')).toBeInTheDocument();
  });

  it('renders tier badges', () => {
    renderWithI18n(<TierList comps={mockComps} source="live" />);
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders winrates', () => {
    renderWithI18n(<TierList comps={mockComps} source="live" />);
    expect(screen.getByText('62.5% WR')).toBeInTheDocument();
    expect(screen.getByText('58.1% WR')).toBeInTheDocument();
  });

  it('renders champion names', () => {
    renderWithI18n(<TierList comps={mockComps} source="live" />);
    expect(screen.getByText('Jinx')).toBeInTheDocument();
    expect(screen.getByText('Vi')).toBeInTheDocument();
    expect(screen.getByText('Caitlyn')).toBeInTheDocument();
  });

  it('shows no comps message when empty', () => {
    renderWithI18n(<TierList comps={[]} source="live" />);
    expect(screen.getByText(/nenhuma composicao disponivel/i)).toBeInTheDocument();
  });

  it('uses sample comp label in preview mode', () => {
    const previewComps: readonly OverlayCompData[] = [
      {
        source: 'preview',
        compName: 'Ignored Name',
        tier: 'B',
        winrate: 0,
        champions: [
          { id: 'c1', name: 'Champ1', cost: 1, imageUrl: '/c1.png', owned: false },
        ],
      },
    ];
    renderWithI18n(<TierList comps={previewComps} source="preview" />);
    expect(screen.getByText('Comp de Exemplo')).toBeInTheDocument();
  });
});
