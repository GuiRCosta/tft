import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useGameStore } from '../stores/game-store';

/**
 * Auto-manages overlay visibility based on TFT game state.
 *
 * When a TFT match is detected (ChampSelect or InProgress), automatically
 * shows the overlay. When the match ends, hides it.
 *
 * Respects `autoOverlayEnabled` — if disabled, overlay is only toggled manually.
 */
export function useAutoOverlay(): void {
  const isInGame = useGameStore((s) => s.isInGame);
  const autoOverlayEnabled = useGameStore((s) => s.autoOverlayEnabled);
  const setOverlayVisible = useGameStore((s) => s.setOverlayVisible);
  const prevIsInGame = useRef(false);

  useEffect(() => {
    if (!autoOverlayEnabled) {
      return;
    }

    const wasInGame = prevIsInGame.current;
    prevIsInGame.current = isInGame;

    if (isInGame && !wasInGame) {
      invoke('show_overlay').then(() => {
        setOverlayVisible(true);
      }).catch(() => {
        // Overlay window may not be available
      });
    } else if (!isInGame && wasInGame) {
      invoke('hide_overlay').then(() => {
        setOverlayVisible(false);
      }).catch(() => {
        // Overlay window may not be available
      });
    }
  }, [isInGame, autoOverlayEnabled, setOverlayVisible]);
}
