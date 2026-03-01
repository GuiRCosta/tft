import { useTranslation } from 'react-i18next';
import { tokens } from '../../shared/design/tokens';
import { CompTracker } from './CompTracker';
import type { OverlayCompData } from '../../shared/utils/sample-comp';

interface TierListProps {
  readonly comps: readonly OverlayCompData[];
  readonly source: 'preview' | 'live';
}

export function TierList({ comps, source }: TierListProps) {
  const { t } = useTranslation();

  if (comps.length === 0) {
    return (
      <div
        className="px-3 py-2 rounded-lg text-xs"
        style={{
          backgroundColor: tokens.colors.background.overlay,
          color: tokens.colors.text.muted,
        }}
      >
        {t('overlay.noComps')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {comps.map((comp) => (
        <CompTracker
          key={comp.compName}
          compName={source === 'preview' ? t('overlay.sampleComp') : comp.compName}
          tier={comp.tier}
          winrate={comp.winrate}
          champions={comp.champions}
          source={source}
        />
      ))}
    </div>
  );
}
