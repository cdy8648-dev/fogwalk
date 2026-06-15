import type { Landmark } from '../types';

/**
 * 주변 랜드마크 발견 로직을 노출하는 훅.
 * Phase 3 에서 OSM 조회 + 근접 발견 + DB 반영 로직을 채운다.
 */
export function useLandmark() {
  const nearby: Landmark[] = [];
  return { nearby };
}
