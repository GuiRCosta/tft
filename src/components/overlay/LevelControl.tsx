import { useTranslation } from 'react-i18next';
import { tokens } from '../../shared/design/tokens';

interface LevelControlProps {
  readonly level: number;
  readonly xpToNext: number;
}

export function LevelControl({ level, xpToNext }: LevelControlProps) {
  const { t } = useTranslation();

  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-lg"
      style={{
        backgroundColor: tokens.colors.background.overlay,
        backdropFilter: `blur(${tokens.overlay.blur})`,
      }}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-xs" style={{ color: tokens.colors.text.muted }}>
          {t('overlay.levelLabel')}
        </span>
        <span className="text-lg font-bold" style={{ color: tokens.colors.accent.gold }}>
          {level}
        </span>
      </div>

      {xpToNext > 0 && (
        <span className="text-[10px]" style={{ color: tokens.colors.text.muted }}>
          {t('overlay.xpToNext', { xp: xpToNext })}
        </span>
      )}

      <span
        className="text-[9px] ml-auto px-1.5 py-0.5 rounded"
        style={{
          backgroundColor: tokens.colors.background.tertiary,
          color: tokens.colors.text.muted,
        }}
      >
        {t('overlay.levelShortcutHint')}
      </span>
    </div>
  );
}
