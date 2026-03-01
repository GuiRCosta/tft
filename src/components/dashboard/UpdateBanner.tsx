import { useTranslation } from 'react-i18next';
import { tokens } from '../../shared/design/tokens';
import { useUpdater } from '../../hooks/use-updater';

export function UpdateBanner() {
  const { t } = useTranslation();
  const { status, updateInfo, hasUpdate, installUpdate } = useUpdater();

  const isInstalling = status === 'downloading' || status === 'installing';
  const shouldShow = (hasUpdate || isInstalling) && updateInfo;

  if (!shouldShow) {
    return null;
  }

  return (
    <div
      className="w-full max-w-md px-4 py-3 rounded-lg mb-4 flex items-center justify-between"
      style={{
        backgroundColor: tokens.colors.background.tertiary,
        border: `1px solid ${tokens.colors.semantic.info}`,
      }}
    >
      <div>
        <p className="text-sm font-semibold" style={{ color: tokens.colors.text.primary }}>
          {t('updater.available', { version: updateInfo.version })}
        </p>
        <p className="text-xs" style={{ color: tokens.colors.text.muted }}>
          {t('updater.clickToInstall')}
        </p>
      </div>
      <button
        onClick={installUpdate}
        disabled={isInstalling}
        className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200"
        style={{
          backgroundColor: isInstalling
            ? tokens.colors.background.secondary
            : tokens.colors.semantic.info,
          color: tokens.colors.text.primary,
          opacity: isInstalling ? 0.6 : 1,
        }}
      >
        {isInstalling ? t('updater.installing') : t('updater.install')}
      </button>
    </div>
  );
}
