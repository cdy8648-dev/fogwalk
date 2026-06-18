import { latLngToCell } from 'h3-js';

import { CONFIG } from '../constants/config';
import { isAreaFetched, markAreaFetched, upsertLandmark } from './db';
import { fetchLandmarksAround } from './osm';

/**
 * 새 지역(H3 LANDMARK_FETCH_CELL_RES 셀) 진입 시에만 OSM 조회 → DB 저장.
 * fire-and-forget로 호출. 네트워크 실패 시 셀을 마킹하지 않아 다음에 재시도.
 */
let inFlight = false;

export async function ensureLandmarksFetched(
  lat: number,
  lng: number
): Promise<void> {
  if (inFlight) return;
  const cell = latLngToCell(lat, lng, CONFIG.LANDMARK_FETCH_CELL_RES);
  if (isAreaFetched(cell)) return;

  inFlight = true;
  try {
    const landmarks = await fetchLandmarksAround(
      lat,
      lng,
      CONFIG.LANDMARK_FETCH_RADIUS_M
    );
    if (landmarks === null) return; // 네트워크 실패 → 마킹 안 함(재시도)
    for (const lm of landmarks) upsertLandmark(lm);
    markAreaFetched(cell);
  } finally {
    inFlight = false;
  }
}
