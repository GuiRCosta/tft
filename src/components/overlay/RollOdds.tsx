import { useTranslation } from 'react-i18next';
import { ROLL_ODDS } from '../../shared/constants';
import { tokens } from '../../shared/design/tokens';

interface RollOddsProps {
  readonly currentLevel: number;
}

const COST_LABELS = ['1', '2', '3', '4', '5'];

export function RollOdds({ currentLevel }: RollOddsProps) {
  const { t } = useTranslation();
  const odds = ROLL_ODDS[currentLevel] ?? ROLL_ODDS[1];

  return (
    <div className="px-3 py-2 rounded-lg" style={{
      backgroundColor: tokens.colors.background.overlay,
      backdropFilter: `blur(${tokens.overlay.blur})`,
    }}>
      <div className="text-[10px] font-medium mb-1.5" style={{ color: tokens.colors.text.muted }}>
        {t('overlay.rollOdds', { level: currentLevel })}
      </div>
      <div className="flex gap-1">
        {odds.map((percent, index) => (
          <div key={COST_LABELS[index]} className="flex-1 text-center">
            <div
              className="text-[10px] font-bold mb-0.5"
              style={{ color: tokens.colors.cost[index + 1] }}
            >
              {COST_LABELS[index]}
            </div>
            <div
              className="text-xs font-semibold rounded px-1 py-0.5"
              style={{
                backgroundColor: tokens.colors.background.tertiary,
                color: percent > 0 ? tokens.colors.text.primary : tokens.colors.text.muted,
              }}
            >
              {percent}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
