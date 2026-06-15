import type { Coordinate, Landmark } from '../types';

/**
 * OSM(Overpass / OpenStreetMap) API 전담 모듈.
 * Phase 3 에서 채운다 — 주어진 좌표 반경의 랜드마크(타워/공원/사원 등)를 조회한다.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fetchNearbyLandmarks(
  _center: Coordinate,
  _radiusM: number
): Promise<Landmark[]> {
  // Phase 3: Overpass API 쿼리 구현 예정.
  return [];
}
