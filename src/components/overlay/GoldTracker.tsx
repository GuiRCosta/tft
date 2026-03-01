import { useTranslation } from 'react-i18next';
import { tokens } from '../../shared/design/tokens';

interface GoldTrackerProps {
  readonly gold: number;
  readonly level: number;
  readonly xp: number;
  readonly xpToNext: number;
}

export function GoldTracker({ gold, level, xp, xpToNext }: GoldTrackerProps) {
  const { t } = useTranslation();
  const xpPercent = xpToNext > 0 ? Math.round((xp / xpToNext) * 100) : 0;

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{
      backgroundColor: tokens.colors.background.overlay,
      backdropFilter: `blur(${tokens.overlay.blur})`,
    }}>
      <div className="flex items-center gap-1">
        <span className="text-xs" style={{ color: tokens.colors.text.muted }}>
          {t('overlay.level')}
        </span>
        <span className="text-sm font-semibold" style={{ color: tokens.colors.accent.gold }}>
          {level}
        </span>
      </div>

      <div className="flex-1">
        <div className="h-1.5 rounded-full overflow-hidden" style={{
          backgroundColor: tokens.colors.background.tertiary,
        }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${xpPercent}%`,
              backgroundColor: tokens.colors.semantic.info,
            }}
          />
        </div>
        <span className="text-[10px]" style={{ color: tokens.colors.text.muted }}>
          {t('overlay.xp', { current: xp, max: xpToNext })}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-sm font-bold" style={{ color: tokens.colors.cost[5] }}>
          {gold}
        </span>
        <span className="text-xs" style={{ color: tokens.colors.text.muted }}>
          {t('overlay.gold')}
        </span>
      </div>
    </div>
  );
}
