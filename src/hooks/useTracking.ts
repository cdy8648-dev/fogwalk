import { useMapStore } from '../store/mapStore';

/**
 * 추적 세션 상태/제어를 노출하는 훅.
 * Phase 2 에서 GPS 구독 + 세션 시작/종료 + 거리 누적 로직을 채운다.
 */
export function useTracking() {
  const isTracking = useMapStore((s) => s.isTracking);
  const activeSessionId = useMapStore((s) => s.activeSessionId);
  return { isTracking, activeSessionId };
}
