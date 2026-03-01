import { useTranslation } from 'react-i18next';
import { tokens } from '../../shared/design/tokens';
import { useDdragon } from '../../hooks/use-ddragon';
import { useMetaComps } from '../../hooks/use-meta-comps';
import { useOverlayData } from '../../hooks/use-overlay-data';
import { useLevelShortcuts } from '../../hooks/use-level-shortcuts';
import { useGameSessionEvents } from '../../hooks/use-game-session-events';
import { TierList } from './TierList';
import { RollOdds } from './RollOdds';
import { LevelControl } from './LevelControl';
import { OverlayLoading } from './OverlayLoading';
import { OverlayError } from './OverlayError';

export function OverlayApp() {
  const { t } = useTranslation();

  // Overlay window has its own JS context — needs its own DDragon + MetaComps init
  useDdragon();
  useMetaComps();

  // Wire game lifecycle and level shortcut events
  useGameSessionEvents();
  useLevelShortcuts();

  const { isLoading, isError, errorMessage, comps, player, source } = useOverlayData();

  return (
    <div
      className="w-full h-full p-2 flex flex-col gap-2"
      style={{ fontFamily: tokens.typography.fontFamily.primary }}
    >
      <div
        className="text-[10px] font-medium px-2 py-1 rounded self-start"
        style={{
          backgroundColor: tokens.colors.background.overlay,
          color: tokens.colors.accent.gold,
        }}
      >
        {t('overlay.title')}
      </div>

      {isLoading && <OverlayLoading />}

      {isError && <OverlayError message={errorMessage} />}

      {!isLoading && !isError && comps.length > 0 && (
        <>
          <TierList comps={comps} source={source} />

          <RollOdds currentLevel={player.level} />

          <LevelControl level={player.level} xpToNext={player.xpToNext} />
        </>
      )}

      <div
        className="text-[9px] px-2 py-1 rounded mt-auto self-start"
        style={{
          backgroundColor: tokens.colors.background.overlay,
          color: tokens.colors.text.muted,
        }}
      >
        {t('overlay.shortcutHint', { shortcut: t('common.shortcutToggle') })}
      </div>
    </div>
  );
}
