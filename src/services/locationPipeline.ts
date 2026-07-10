import { CONFIG } from '../constants/config';
import { useMapStore } from '../store/mapStore';
import { haversineMeters } from '../utils/distance';
import { pathRevealTiles, revealTilesFor } from '../utils/h3';
import { getProgress, insertVisitedTiles } from './db';
import { recordMovement, refreshProgressStore } from './progress';

/**
 * 위치 픽스 공용 파이프라인 — 백그라운드 태스크 / 포그라운드 watch / 지오펜스 브레드크럼이
 * 전부 여기로 들어온다. 픽스 주변 reveal + 직전 지점과의 H3 경로 보간(구멍 메움) +
 * 진행도 기록 + 스토어 반영.
 */

export interface Fix {
  lat: number;
  lng: number;
  accuracy: number | null; // null = 신뢰(초기 위치 등 이미 필터된 소스)
  speed: number | null;
}

export function processFixes(
  fixes: Fix[],
  accuracyMaxM: number = CONFIG.GPS_ACCURACY_MAX_M
): void {
  if (fixes.length === 0) return;

  // 직전 지점(영속) — 백그라운드 재실행/지오펜스 깨움처럼 컨텍스트가 끊겨도 이어짐
  const p = getProgress();
  let prev =
    p.lastLat != null && p.lastLng != null ? { lat: p.lastLat, lng: p.lastLng } : null;

  const freshAll: string[] = [];
  let last: { lat: number; lng: number } | null = null;

  for (const f of fixes) {
    if (f.accuracy != null && f.accuracy > accuracyMaxM) continue; // GPS 튐 방지

    // 픽스 주변 + (합리적 간격이면) 직전 지점에서 오는 경로 보간
    let tiles = revealTilesFor(f.lat, f.lng);
    if (prev) {
      const d = haversineMeters(prev, f);
      if (d > 0 && d <= CONFIG.PATH_FILL_MAX_M) {
        tiles = tiles.concat(pathRevealTiles(prev.lat, prev.lng, f.lat, f.lng));
      }
    }

    const fresh = insertVisitedTiles([...new Set(tiles)]);
    recordMovement(f.lat, f.lng, f.speed, fresh.length); // 거리·스트릭·XP·발견·국가적립
    if (fresh.length) freshAll.push(...fresh);
    prev = { lat: f.lat, lng: f.lng };
    last = prev;
  }

  // 스토어 반영 — 포그라운드면 화면 갱신, 백그라운드면 무해
  const store = useMapStore.getState();
  if (last) store.setLocation(last);
  if (freshAll.length) store.addVisitedTiles(freshAll);
  refreshProgressStore(true);
}
