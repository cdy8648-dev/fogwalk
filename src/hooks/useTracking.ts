import { useEffect, useState } from 'react';

import { insertVisitedTiles } from '../services/db';
import { getCurrentOnce, requestPermission, startWatch } from '../services/gps';
import { useMapStore } from '../store/mapStore';
import { revealTilesFor } from '../utils/h3';

type TrackingStatus = 'loading' | 'granted' | 'denied';

/**
 * 핵심 추적 루프. MapScreen mount 시 동작.
 * 권한 → 초기 위치 reveal → watch 구독으로 이동마다 타일 기록.
 */
export function useTracking(): { status: TrackingStatus } {
  const [status, setStatus] = useState<TrackingStatus>('loading');
  const setLocation = useMapStore((s) => s.setLocation);
  const addVisitedTiles = useMapStore((s) => s.addVisitedTiles);

  useEffect(() => {
    let cancelled = false;
    let sub: { remove: () => void } | null = null;

    const reveal = (lat: number, lng: number) => {
      const fresh = insertVisitedTiles(revealTilesFor(lat, lng));
      if (fresh.length) addVisitedTiles(fresh);
    };

    (async () => {
      const granted = await requestPermission();
      if (cancelled) return;
      if (!granted) {
        setStatus('denied');
        return;
      }
      setStatus('granted');

      try {
        const c = await getCurrentOnce();
        if (cancelled) return;
        setLocation(c);
        reveal(c.lat, c.lng);
      } catch {
        // 초기 위치 실패는 무시 — watch가 곧 위치를 잡는다.
      }

      sub = await startWatch((c) => {
        setLocation(c);
        reveal(c.lat, c.lng);
      });
      if (cancelled) sub.remove();
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [setLocation, addVisitedTiles]);

  return { status };
}
