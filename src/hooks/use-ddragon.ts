import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { useDdragonStore } from '../stores/ddragon-store';
import type {
  DDragonChampion,
  DDragonItem,
  DDragonTrait,
  DDragonLoadedPayload,
  DDragonErrorPayload,
} from '../shared/types/ddragon';

async function fetchDataForLocale(
  locale: string,
  setChampions: (c: readonly DDragonChampion[]) => void,
  setItems: (i: readonly DDragonItem[]) => void,
  setTraits: (t: readonly DDragonTrait[]) => void,
): Promise<void> {
  try {
    const [champions, items, traits] = await Promise.all([
      invoke<DDragonChampion[]>('get_ddragon_champions', { locale }),
      invoke<DDragonItem[]>('get_ddragon_items', { locale }),
      invoke<DDragonTrait[]>('get_ddragon_traits', { locale }),
    ]);
    setChampions(champions);
    setItems(items);
    setTraits(traits);
  } catch (_error) {
    // Dados podem nao estar prontos ainda
  }
}

export function useDdragon(): void {
  const { i18n } = useTranslation();
  const setStatus = useDdragonStore((s) => s.setStatus);
  const setVersion = useDdragonStore((s) => s.setVersion);
  const setCurrentSet = useDdragonStore((s) => s.setCurrentSet);
  const setChampions = useDdragonStore((s) => s.setChampions);
  const setItems = useDdragonStore((s) => s.setItems);
  const setTraits = useDdragonStore((s) => s.setTraits);
  const setError = useDdragonStore((s) => s.setError);

  useEffect(() => {
    const unlisteners: Array<() => void> = [];

    async function setup() {
      const unlistenLoaded = await listen<DDragonLoadedPayload>('ddragon:loaded', async (event) => {
        setVersion(event.payload.version);
        setCurrentSet(event.payload.currentSet);
        await fetchDataForLocale(i18n.language, setChampions, setItems, setTraits);
        setStatus('loaded');
      });
      unlisteners.push(unlistenLoaded);

      const unlistenUpdating = await listen('ddragon:updating', () => {
        setStatus('loading');
      });
      unlisteners.push(unlistenUpdating);

      const unlistenError = await listen<DDragonErrorPayload>('ddragon:error', (event) => {
        setError(event.payload.message);
        setStatus('error');
      });
      unlisteners.push(unlistenError);

      await fetchDataForLocale(i18n.language, setChampions, setItems, setTraits);
    }

    setup();

    return () => {
      unlisteners.forEach((fn) => fn());
    };
  }, [setStatus, setVersion, setCurrentSet, setChampions, setItems, setTraits, setError, i18n.language]);
}
