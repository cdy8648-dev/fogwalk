import { AppState } from 'react-native';

import { CONFIG } from '../constants/config';
import { useMapStore } from '../store/mapStore';
import { haversineMeters } from '../utils/distance';
import { pathRevealTiles, revealTilesFor } from '../utils/h3';
import { ensureCountry } from './country';
import { getProgress, insertVisitedTiles, setSetting } from './db';
import { checkLandmarkDiscoveries } from './discovery';
import { centerBreadcrumbFence } from './gps';
import { ensureLandmarksFetched } from './landmarks';
import { recordMovement, refreshProgressStore } from './progress';
import { attributeRevealedTiles } from './regionPack';
import { noteFixForSleep } from './trackingSleep';

// 브레드크럼 펜스를 이동에 맞춰 따라 옮김(반경 초과 시만) — GPS 조회 없는 재등록이라 저비용.
// 본추적 생존 중 펜스가 수십 km 뒤에 남으면, 이후 앱 종료 시 이탈 이벤트가 영영 안 온다.
let fenceCenter: { lat: number; lng: number } | null = null;

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
    recordMovement(f.lat, f.lng, f.speed, fresh.length); // 거리·스트릭·XP
    if (fresh.length) attributeRevealedTiles(fresh); // 여권 적립 — H3 팩 O(1)/타일
    checkLandmarkDiscoveries(f.lat, f.lng); // 근접 발견 (인덱스드 bbox — 저비용)
    if (fresh.length) freshAll.push(...fresh);
    prev = { lat: f.lat, lng: f.lng };
    last = prev;
  }

  if (last) {
    // 🔋 네트워크(OSM 랜드마크 수집·국가 역지오코딩)는 포그라운드에서만.
    // 백그라운드 주행 중 셀마다 Overpass를 부르던 것이 배터리/발열 주범이었다.
    // 밀린 지역은 앱을 열고 이동할 때 자연 수집되고, 국가는 refreshCountry가 보정.
    if (AppState.currentState === 'active') {
      void ensureLandmarksFetched(last.lat, last.lng);
      void ensureCountry(last.lat, last.lng);
    }
    // 지오펜스 브레드크럼 중복 방지용 — 본추적 생존 신호
    setSetting('last_fix_at', String(Date.now()));
    // 정지 슬립 판정(백그라운드 정지 지속 시 GPS 종료 — 수면 배터리 대책)
    noteFixForSleep(last.lat, last.lng);
    // 펜스 추종 — 종료 대비 브레드크럼이 항상 현재 위치 주변에서 대기하도록
    if (!fenceCenter || haversineMeters(fenceCenter, last) > CONFIG.FENCE_RADIUS_M) {
      fenceCenter = last;
      centerBreadcrumbFence(last.lat, last.lng).catch(() => {}); // 권한 없으면 조용히 무시
    }
  }

  // 스토어 반영 — 포그라운드면 화면 갱신, 백그라운드면 무해
  const store = useMapStore.getState();
  if (last) store.setLocation(last);
  if (freshAll.length) store.addVisitedTiles(freshAll);
  refreshProgressStore(true);
}
