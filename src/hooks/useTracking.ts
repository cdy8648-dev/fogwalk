import { useEffect, useState } from 'react';

import { insertVisitedTiles } from '../services/db';
import {
  getCurrentOnce,
  requestBackgroundPermission,
  requestPermission,
  startBackgroundTracking,
  startWatch,
} from '../services/gps';
import { useMapStore } from '../store/mapStore';
import { revealTilesFor } from '../utils/h3';

type TrackingStatus = 'loading' | 'granted' | 'denied';

/** 좌표 1건 처리: 위치 갱신 + 타일 reveal + 스토어 반영 (포그라운드 경로용). */
function handle(lat: number, lng: number): void {
  const store = useMapStore.getState();
  store.setLocation({ lat, lng });
  const fresh = insertVisitedTiles(revealTilesFor(lat, lng));
  if (fresh.length) store.addVisitedTiles(fresh);
}

/**
 * 추적 부트스트랩. MapScreen mount 시 1회.
 * 권한 → 초기 위치 → "항상 허용"이면 백그라운드 태스크, 아니면 포그라운드 watch 폴백.
 * 백그라운드 추적은 언마운트해도 멈추지 않는다(계속 기록).
 */
export function useTracking(): { status: TrackingStatus } {
  const [status, setStatus] = useState<TrackingStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    let foregroundSub: { remove: () => void } | null = null;

    (async () => {
      const granted = await requestPermission();
      if (cancelled) return;
      if (!granted) {
        setStatus('denied');
        return;
      }
      setStatus('granted');

      // 즉시 초기 위치 (카메라 센터 + 첫 reveal)
      try {
        const c = await getCurrentOnce();
        if (cancelled) return;
        handle(c.lat, c.lng);
      } catch {
        // 초기 위치 실패는 무시 — 추적이 곧 위치를 잡는다.
      }

      const bgGranted = await requestBackgroundPermission();
      if (cancelled) return;

      if (bgGranted) {
        try {
          await startBackgroundTracking(); // 위치 처리는 locationTask가 담당
          return;
        } catch (e) {
          console.warn('[useTracking] background start failed, fallback:', e);
        }
      }
      // 폴백: 포그라운드에서만 추적
      foregroundSub = await startWatch((c) => handle(c.lat, c.lng));
      if (cancelled) foregroundSub.remove();
    })();

    return () => {
      cancelled = true;
      foregroundSub?.remove(); // 포그라운드 폴백만 정리. 백그라운드 추적은 유지.
    };
  }, []);

  return { status };
}
