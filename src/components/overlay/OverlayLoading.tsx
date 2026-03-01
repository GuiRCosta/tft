import { useTranslation } from 'react-i18next';
import { tokens } from '../../shared/design/tokens';

export function OverlayLoading() {
  const { t } = useTranslation();

  return (
    <div
      className="px-3 py-2 rounded-lg flex items-center gap-2"
      style={{
        backgroundColor: tokens.colors.background.overlay,
        backdropFilter: `blur(${tokens.overlay.blur})`,
      }}
    >
      <div
        className="w-3 h-3 rounded-full animate-pulse"
        style={{ backgroundColor: tokens.colors.semantic.info }}
      />
      <span className="text-xs" style={{ color: tokens.colors.text.muted }}>
        {t('overlay.loading')}
      </span>
    </div>
  );
}
