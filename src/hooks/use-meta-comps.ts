import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { useMetaCompsStore } from '../stores/meta-comps-store';
import type { RawMetaComp, MetaCompsLoadedPayload, MetaCompsErrorPayload } from '../shared/types/meta-comps';

async function fetchMetaComps(
  setComps: (comps: readonly RawMetaComp[]) => void,
): Promise<void> {
  try {
    const comps = await invoke<RawMetaComp[]>('get_meta_comps');
    setComps(comps);
  } catch (_error) {
    // Data may not be ready yet
  }
}

export function useMetaComps(): void {
  const setStatus = useMetaCompsStore((s) => s.setStatus);
  const setVersion = useMetaCompsStore((s) => s.setVersion);
  const setPatch = useMetaCompsStore((s) => s.setPatch);
  const setComps = useMetaCompsStore((s) => s.setComps);
  const setError = useMetaCompsStore((s) => s.setError);

  useEffect(() => {
    const unlisteners: Array<() => void> = [];

    async function setup() {
      const unlistenLoaded = await listen<MetaCompsLoadedPayload>(
        'metacomps:loaded',
        async (event) => {
          setVersion(event.payload.version);
          setPatch(event.payload.patch);
          await fetchMetaComps(setComps);
          setStatus('loaded');
        },
      );
      unlisteners.push(unlistenLoaded);

      const unlistenError = await listen<MetaCompsErrorPayload>(
        'metacomps:error',
        (event) => {
          setError(event.payload.message);
          setStatus('error');
        },
      );
      unlisteners.push(unlistenError);

      await fetchMetaComps(setComps);
    }

    setup();

    return () => {
      unlisteners.forEach((fn) => fn());
    };
  }, [setStatus, setVersion, setPatch, setComps, setError]);
}
