import { AppState } from 'react-native';

import { CATEGORY_EMOJI, landmarkDisplayName, landmarkXp } from '../constants/landmarks';
import { CONFIG } from '../constants/config';
import { useAchievementStore } from '../store/achievementStore';
import { isDetailGrade, useDiscoveryPopupStore } from '../store/discoveryPopupStore';
import { useLandmarkStore } from '../store/landmarkStore';
import { useMapStore } from '../store/mapStore';
import type { Landmark } from '../types';
import { haversineMeters } from '../utils/distance';
import { coordToTile, dilateTiles } from '../utils/h3';
import { attributeTiles } from './country';
import { checkBadges } from './badges';
import { upgradeDiscoveryName } from './landmarkNames';
import {
  getProgress,
  getUncelebratedDiscoveries,
  getUndiscoveredLandmarksNear,
  insertVisitedTiles,
  markLandmarkDiscovered,
  markLandmarksCelebrated,
  updateProgress,
} from './db';

/** 발견 판정 반경 — 공항은 폴리곤 중심이 활주로라 전용 광역 반경. */
function discoverRadiusM(lm: Landmark): number {
  return lm.category === 'airport'
    ? CONFIG.LANDMARK_DISCOVER_RADIUS_AIRPORT_M
    : CONFIG.LANDMARK_DISCOVER_RADIUS_M;
}

/**
 * 현재 위치 근처의 미발견 랜드마크를 발견 처리. recordMovement 끝에서 호출.
 * 발견 시: 마킹 + 주변 안개 뻥(Civ st.) + 희귀도 XP + 축하(팝업/토스트 라우팅).
 */
export function checkLandmarkDiscoveries(lat: number, lng: number): void {
  // bbox는 가장 넓은 반경(공항)으로 조회 → 실제 판정은 카테고리별 원형 거리로
  const near = getUndiscoveredLandmarksNear(
    lat,
    lng,
    CONFIG.LANDMARK_DISCOVER_RADIUS_AIRPORT_M
  );
  if (near.length === 0) return;

  const now = Date.now();
  const found: Landmark[] = [];
  for (const lm of near) {
    const d = haversineMeters({ lat, lng }, { lat: lm.lat, lng: lm.lng });
    if (d > discoverRadiusM(lm)) continue;
    discover(lm, now);
    found.push({ ...lm, discoveredAt: now });
  }
  if (found.length) {
    routeCelebration(found); // 발견 팝업/토스트 (뱃지 카드보다 앞)
    checkBadges('discover'); // 발견 배치당 1회 — 해금 뱃지 카드는 발견 카드 뒤 스택에 쌓임
  }
}

function discover(lm: Landmark, now: number): void {
  markLandmarkDiscovered(lm.osmId, now);

  // 🎆 안개 뻥: 랜드마크 중심 주변을 한 번에 reveal
  const burst = dilateTiles(
    [coordToTile(lm.lat, lm.lng)],
    CONFIG.LANDMARK_BURST_RADIUS_K
  );
  const fresh = insertVisitedTiles(burst);
  if (fresh.length) {
    useMapStore.getState().addVisitedTiles(fresh);
    attributeTiles(fresh.length);
  }

  // 보상: 희귀도/유형 XP
  const p = getProgress();
  updateProgress({ totalXp: p.totalXp + landmarkXp(lm) });

  // 발견 목록(마커·도감용) 갱신
  useLandmarkStore.getState().add({ ...lm, discoveredAt: now });

  // 현지어 원문이면 Wikidata로 표시 이름 업그레이드 (해외 발견) — 조용히 백그라운드
  void upgradeDiscoveryName({ ...lm, discoveredAt: now });
  // (뱃지 판정은 checkLandmarkDiscoveries 에서 배치당 1회 — 풀스캔 중복 방지)
}

/**
 * 축하 라우팅: 포그라운드+희귀 이상 → 발견 순간(02)→카드(03) 팝업.
 * 포그라운드+일반뿐 → 기존 토스트. 백그라운드 → celebrated=0 유지,
 * 복귀 시 flushPendingDiscoveries 가 요약 카드로 보여준다.
 */
function routeCelebration(batch: Landmark[]): void {
  if (AppState.currentState !== 'active') return;
  markLandmarksCelebrated(batch.map((lm) => lm.osmId));

  if (batch.some(isDetailGrade)) {
    useDiscoveryPopupStore.getState().showLive(batch);
    return;
  }
  for (const lm of batch) {
    useAchievementStore.getState().celebrate({
      emoji: CATEGORY_EMOJI[lm.category] ?? '📍',
      title: lm.category === 'subway' ? '🚇 지하철역 발견!' : '랜드마크 발견!',
      subtitle: landmarkDisplayName(lm),
    });
  }
}

/** 백그라운드에서 쌓인 미표시 발견을 복귀 요약 카드로. 앱 시작·활성화 시 호출. */
export function flushPendingDiscoveries(): void {
  const pending = getUncelebratedDiscoveries();
  if (pending.length === 0) return;
  markLandmarksCelebrated(pending.map((lm) => lm.osmId));
  useDiscoveryPopupStore.getState().showRecap(pending);
}
