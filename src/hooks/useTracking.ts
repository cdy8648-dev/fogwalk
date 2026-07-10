import { useEffect, useState } from 'react';

import {
  centerBreadcrumbFence,
  getCurrentOnce,
  requestBackgroundPermission,
  requestPermission,
  startBackgroundTracking,
  startWatch,
} from '../services/gps';
import { processFixes } from '../services/locationPipeline';

type TrackingStatus = 'loading' | 'granted' | 'denied';

/**
 * 추적 부트스트랩. MapScreen mount 시 1회.
 * 권한 → 초기 위치 → "항상 허용"이면 백그라운드 태스크 + 브레드크럼 지오펜스,
 * 아니면 포그라운드 watch 폴백. 픽스 처리는 공용 파이프라인(locationPipeline).
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

      // 즉시 초기 위치 (카메라 센터 + 첫 reveal). accuracy=null → 신뢰(단발 조회).
      let initial: { lat: number; lng: number } | null = null;
      try {
        initial = await getCurrentOnce();
        if (cancelled) return;
        processFixes([{ lat: initial.lat, lng: initial.lng, accuracy: null, speed: null }]);
      } catch {
        // 초기 위치 실패는 무시 — 추적이 곧 위치를 잡는다.
      }

      const bgGranted = await requestBackgroundPermission();
      if (cancelled) return;

      if (bgGranted) {
        try {
          await startBackgroundTracking(); // 위치 처리는 locationTask가 담당
          // 브레드크럼 지오펜스 — 앱 종료 후에도 이탈마다 깨어나 1점씩 기록
          if (initial) centerBreadcrumbFence(initial.lat, initial.lng).catch(() => {});
          return;
        } catch (e) {
          console.warn('[useTracking] background start failed, fallback:', e);
        }
      }
      // 폴백: 포그라운드에서만 추적 (startWatch가 정확도 필터를 이미 거침 → accuracy=null)
      foregroundSub = await startWatch((lat, lng, speed) =>
        processFixes([{ lat, lng, accuracy: null, speed }])
      );
      if (cancelled) foregroundSub.remove();
    })();

    return () => {
      cancelled = true;
      foregroundSub?.remove(); // 포그라운드 폴백만 정리. 백그라운드 추적은 유지.
    };
  }, []);

  return { status };
}
