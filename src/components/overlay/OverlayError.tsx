import { useTranslation } from 'react-i18next';
import { tokens } from '../../shared/design/tokens';

interface OverlayErrorProps {
  readonly message: string | null;
}

export function OverlayError({ message }: OverlayErrorProps) {
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
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: tokens.colors.semantic.danger }}
      />
      <span className="text-xs" style={{ color: tokens.colors.semantic.danger }}>
        {message ?? t('overlay.errorGeneric')}
      </span>
    </div>
  );
}
