import { useTranslation } from 'react-i18next';
import { tokens } from '../../shared/design/tokens';
import { ChampionIcon } from './ChampionIcon';
import { ItemIcon } from './ItemIcon';
import type { TierRank } from '../../shared/types';
import type { OverlayChampion } from '../../shared/utils/sample-comp';

interface CompTrackerProps {
  readonly compName: string;
  readonly tier: TierRank;
  readonly winrate: number;
  readonly champions: readonly OverlayChampion[];
  readonly source?: 'preview' | 'live';
}

export function CompTracker({ compName, tier, winrate, champions, source }: CompTrackerProps) {
  const { t } = useTranslation();

  return (
    <div
      className="px-3 py-2 rounded-lg"
      style={{
        backgroundColor: tokens.colors.background.overlay,
        backdropFilter: `blur(${tokens.overlay.blur})`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: tokens.colors.tier[tier],
              color: tokens.colors.text.inverse,
            }}
          >
            {tier}
          </span>
          <span className="text-sm font-semibold" style={{ color: tokens.colors.text.primary }}>
            {compName}
          </span>
          {source === 'preview' && (
            <span
              className="text-[8px] px-1 py-0.5 rounded font-medium"
              style={{
                backgroundColor: tokens.colors.semantic.warning,
                color: tokens.colors.text.inverse,
              }}
            >
              {t('overlay.preview')}
            </span>
          )}
        </div>
        {winrate > 0 && (
          <span className="text-xs" style={{ color: tokens.colors.semantic.success }}>
            {t('overlay.winrate', { value: winrate })}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {champions.map((champ) => (
          <div
            key={champ.id}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]"
            style={{
              border: `1px solid ${tokens.colors.cost[champ.cost]}`,
              backgroundColor: champ.owned
                ? `${tokens.colors.cost[champ.cost]}20`
                : 'transparent',
              color: champ.owned ? tokens.colors.text.primary : tokens.colors.text.muted,
            }}
          >
            <ChampionIcon
              name={champ.name}
              imageUrl={champ.imageUrl}
              cost={champ.cost}
              size={18}
            />
            {champ.name}
            {champ.items && champ.items.length > 0 && (
              <div className="flex items-center gap-0.5 ml-0.5">
                {champ.items.map((item) => (
                  <ItemIcon key={item.id} name={item.name} imageUrl={item.imageUrl} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
