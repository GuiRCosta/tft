import { useCallback, useEffect } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { useUpdaterStore } from '../stores/updater-store';

const CHECK_INTERVAL_MS = 30 * 60 * 1000;

export function useUpdater() {
  const status = useUpdaterStore((s) => s.status);
  const updateInfo = useUpdaterStore((s) => s.updateInfo);
  const errorMessage = useUpdaterStore((s) => s.errorMessage);
  const setStatus = useUpdaterStore((s) => s.setStatus);
  const setUpdateInfo = useUpdaterStore((s) => s.setUpdateInfo);
  const setErrorMessage = useUpdaterStore((s) => s.setErrorMessage);

  const checkForUpdates = useCallback(async () => {
    try {
      setStatus('checking');
      setErrorMessage(null);

      const update = await check();

      if (update) {
        setUpdateInfo({
          version: update.version,
          notes: update.body ?? '',
          date: update.date ?? '',
        });
        setStatus('available');
      } else {
        setStatus('idle');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
      setStatus('error');
    }
  }, [setStatus, setUpdateInfo, setErrorMessage]);

  const installUpdate = useCallback(async () => {
    try {
      setStatus('downloading');

      const update = await check();
      if (!update) {
        setStatus('idle');
        return;
      }

      await update.downloadAndInstall((event) => {
        if (event.event === 'Finished') {
          setStatus('installing');
        }
      });

      await relaunch();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
      setStatus('error');
    }
  }, [setStatus, setErrorMessage]);

  useEffect(() => {
    checkForUpdates();

    const interval = setInterval(checkForUpdates, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [checkForUpdates]);

  return {
    status,
    updateInfo,
    errorMessage,
    hasUpdate: status === 'available',
    checkForUpdates,
    installUpdate,
  } as const;
}
