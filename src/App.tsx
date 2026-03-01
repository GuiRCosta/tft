import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';
import './App.css';
import { tokens } from './shared/design/tokens';
import { supportedLanguages, saveLanguage } from './shared/i18n';
import { useLcuEvents } from './hooks/use-lcu-events';
import { useConnectionStatus } from './hooks/use-connection-status';
import { useDdragon } from './hooks/use-ddragon';
import { useAutoOverlay } from './hooks/use-auto-overlay';
import { useGameSessionEvents } from './hooks/use-game-session-events';
import { useGameStore } from './stores/game-store';
import { UpdateBanner } from './components/dashboard/UpdateBanner';

const STATUS_COLORS: Record<string, string> = {
  disconnected: tokens.colors.semantic.danger,
  connecting: tokens.colors.semantic.warning,
  connected: tokens.colors.semantic.success,
};

const PHASE_I18N_MAP: Record<string, string> = {
  None: 'dashboard.phaseNone',
  Lobby: 'dashboard.phaseLobby',
  ChampSelect: 'dashboard.phaseChampSelect',
  InProgress: 'dashboard.phaseInProgress',
  EndOfGame: 'dashboard.phaseEndOfGame',
  WaitingForStats: 'dashboard.phaseWaitingForStats',
};

function App() {
  const { t, i18n } = useTranslation();

  useLcuEvents();
  useDdragon();
  useAutoOverlay();
  useGameSessionEvents();

  const { connectionStatus, summonerName, isDisconnected, isConnected } = useConnectionStatus();
  const overlayVisible = useGameStore((s) => s.overlayVisible);
  const setOverlayVisible = useGameStore((s) => s.setOverlayVisible);
  const gameflowPhase = useGameStore((s) => s.gameflowPhase);
  const isTft = useGameStore((s) => s.isTft);
  const isInGame = useGameStore((s) => s.isInGame);
  const autoOverlayEnabled = useGameStore((s) => s.autoOverlayEnabled);
  const setAutoOverlayEnabled = useGameStore((s) => s.setAutoOverlayEnabled);

  async function handleToggleOverlay() {
    try {
      await invoke('toggle_overlay');
      setOverlayVisible(!overlayVisible);
    } catch (_error) {
      // Overlay pode nao estar disponivel ainda
    }
  }

  async function handleReconnect() {
    try {
      await invoke('reconnect_lcu');
    } catch (_error) {
      // Erro ao reconectar
    }
  }

  function handleLanguageChange(lng: string) {
    i18n.changeLanguage(lng);
    saveLanguage(lng);
  }

  function getStatusText(): string {
    if (connectionStatus === 'connected' && summonerName) {
      return t('dashboard.connectedAs', { name: summonerName });
    }
    return t(`dashboard.${connectionStatus}`);
  }

  function getPhaseText(): string {
    const key = PHASE_I18N_MAP[gameflowPhase];
    return key ? t(key) : t('dashboard.phaseUnknown');
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{
        backgroundColor: tokens.colors.background.primary,
        color: tokens.colors.text.primary,
        fontFamily: tokens.typography.fontFamily.primary,
      }}
    >
      <h1
        className="text-4xl font-bold mb-2"
        style={{ color: tokens.colors.accent.gold }}
      >
        {t('dashboard.title')}
      </h1>
      <p className="text-lg mb-8" style={{ color: tokens.colors.text.secondary }}>
        {t('dashboard.waitingClient')}
      </p>

      <UpdateBanner />

      {/* Status badges */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <div
          className="px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          style={{
            backgroundColor: tokens.colors.background.tertiary,
            border: `1px solid ${tokens.colors.accent.goldMuted}`,
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: STATUS_COLORS[connectionStatus] }}
          />
          {getStatusText()}
        </div>

        {isConnected && gameflowPhase !== 'None' && (
          <div
            className="px-4 py-2 rounded-lg text-sm flex items-center gap-2"
            style={{
              backgroundColor: tokens.colors.background.tertiary,
              border: `1px solid ${isTft ? tokens.colors.accent.gold : tokens.colors.accent.goldMuted}`,
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: isInGame
                  ? tokens.colors.semantic.success
                  : tokens.colors.semantic.warning,
              }}
            />
            {getPhaseText()}
            {isTft && (
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: tokens.colors.accent.gold,
                  color: tokens.colors.text.inverse,
                }}
              >
                TFT
              </span>
            )}
          </div>
        )}

        <div
          className="px-4 py-2 rounded-lg text-sm"
          style={{
            backgroundColor: tokens.colors.background.tertiary,
            border: `1px solid ${tokens.colors.accent.goldMuted}`,
          }}
        >
          {t('common.version', { version: '0.1.0' })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleToggleOverlay}
          className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer"
          style={{
            backgroundColor: overlayVisible
              ? tokens.colors.semantic.danger
              : tokens.colors.accent.gold,
            color: tokens.colors.text.inverse,
          }}
        >
          {overlayVisible ? t('dashboard.hideOverlay') : t('dashboard.showOverlay')}
        </button>

        {isDisconnected && (
          <button
            onClick={handleReconnect}
            className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer"
            style={{
              backgroundColor: tokens.colors.background.tertiary,
              color: tokens.colors.text.secondary,
              border: `1px solid ${tokens.colors.accent.goldMuted}`,
            }}
          >
            {t('dashboard.reconnect')}
          </button>
        )}
      </div>

      {/* Auto-overlay toggle */}
      <div className="flex items-center gap-2 mb-4">
        <label
          className="flex items-center gap-2 text-xs cursor-pointer"
          style={{ color: tokens.colors.text.muted }}
        >
          <input
            type="checkbox"
            checked={autoOverlayEnabled}
            onChange={(e) => setAutoOverlayEnabled(e.target.checked)}
            className="cursor-pointer accent-amber-500"
          />
          {t('dashboard.autoOverlay')}
        </label>
      </div>

      <p className="mt-4 text-xs" style={{ color: tokens.colors.text.muted }}>
        {t('dashboard.shortcutHint', { shortcut: t('common.shortcutToggle') })}
      </p>

      <div className="mt-8 flex items-center gap-2">
        <span className="text-xs" style={{ color: tokens.colors.text.muted }}>
          {t('dashboard.language')}:
        </span>
        <div className="flex gap-1">
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="px-3 py-1 rounded text-xs cursor-pointer transition-all duration-200"
              style={{
                backgroundColor:
                  i18n.language === lang.code
                    ? tokens.colors.accent.gold
                    : tokens.colors.background.tertiary,
                color:
                  i18n.language === lang.code
                    ? tokens.colors.text.inverse
                    : tokens.colors.text.secondary,
                border: `1px solid ${
                  i18n.language === lang.code
                    ? tokens.colors.accent.gold
                    : tokens.colors.accent.goldMuted
                }`,
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

export default App;
