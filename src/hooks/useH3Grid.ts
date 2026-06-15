import { useMapStore } from '../store/mapStore';

/**
 * 방문 타일(H3 셀) 집합을 노출하는 훅.
 * Phase 1 에서 현재 위치 → 타일 계산 → DB 반영 로직을 채운다.
 */
export function useH3Grid() {
  const visitedTileIds = useMapStore((s) => s.visitedTileIds);
  return { visitedTileIds };
}
