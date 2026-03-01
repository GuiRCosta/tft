import { useMemo } from 'react';
import { useDdragonStore } from '../stores/ddragon-store';
import { useGameStore } from '../stores/game-store';
import { usePlayerLevelStore } from '../stores/player-level-store';
import { useMetaCompsStore } from '../stores/meta-comps-store';
import { buildSampleComp } from '../shared/utils/sample-comp';
import { enrichMetaComps } from '../shared/utils/enrich-comps';
import { XP_TO_NEXT_LEVEL } from '../shared/constants/xp-table';
import type { OverlayCompData } from '../shared/utils/sample-comp';

const MAX_VISIBLE_COMPS = 5;

interface OverlayPlayerData {
  readonly level: number;
  readonly xpToNext: number;
}

interface OverlayData {
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly errorMessage: string | null;
  readonly comps: readonly OverlayCompData[];
  readonly player: OverlayPlayerData;
  readonly source: 'preview' | 'live';
}

const DEFAULT_PLAYER: OverlayPlayerData = {
  level: 5,
  xpToNext: 20,
};

export function useOverlayData(): OverlayData {
  const ddragonStatus = useDdragonStore((s) => s.status);
  const ddragonError = useDdragonStore((s) => s.error);
  const champions = useDdragonStore((s) => s.champions);
  const items = useDdragonStore((s) => s.items);
  const isInGame = useGameStore((s) => s.isInGame);
  const manualLevel = usePlayerLevelStore((s) => s.level);
  const rawComps = useMetaCompsStore((s) => s.comps);

  const isLoading = ddragonStatus === 'idle' || ddragonStatus === 'loading';
  const isError = ddragonStatus === 'error';

  const comps = useMemo<readonly OverlayCompData[]>(() => {
    if (champions.length === 0) {
      return [];
    }

    if (rawComps.length > 0) {
      const enriched = enrichMetaComps(rawComps, champions, items);
      return enriched.slice(0, MAX_VISIBLE_COMPS);
    }

    const sample = buildSampleComp(champions);
    return [sample];
  }, [champions, rawComps, items]);

  const player = useMemo<OverlayPlayerData>(() => {
    if (isInGame) {
      return {
        level: manualLevel,
        xpToNext: XP_TO_NEXT_LEVEL[manualLevel] ?? 0,
      };
    }
    return DEFAULT_PLAYER;
  }, [isInGame, manualLevel]);

  return {
    isLoading,
    isError,
    errorMessage: ddragonError,
    comps,
    player,
    source: isInGame ? 'live' : 'preview',
  };
}
