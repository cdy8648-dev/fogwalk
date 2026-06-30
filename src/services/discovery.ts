import { CATEGORY_EMOJI } from '../constants/landmarks';
import { CONFIG } from '../constants/config';
import { useAchievementStore } from '../store/achievementStore';
import { useLandmarkStore } from '../store/landmarkStore';
import { useMapStore } from '../store/mapStore';
import type { Landmark } from '../types';
import { haversineMeters } from '../utils/distance';
import { coordToTile, dilateTiles } from '../utils/h3';
import { attributeTiles } from './country';
import {
  getProgress,
  getUndiscoveredLandmarksNear,
  insertVisitedTiles,
  markLandmarkDiscovered,
  updateProgress,
} from './db';

function landmarkXp(lm: Landmark): number {
  if (lm.category === 'subway') return CONFIG.XP_SUBWAY;
  if (lm.rarity === 'legendary') return CONFIG.XP_LANDMARK_LEGENDARY;
  if (lm.rarity === 'rare') return CONFIG.XP_LANDMARK_RARE;
  return CONFIG.XP_LANDMARK_COMMON;
}

function discoverTitle(lm: Landmark): string {
  if (lm.category === 'subway') return '🚇 지하철역 발견!';
  if (lm.rarity === 'legendary') return '⭐ 전설의 랜드마크 발견!';
  return '랜드마크 발견!';
}

/**
 * 현재 위치 근처의 미발견 랜드마크를 발견 처리. recordMovement 끝에서 호출.
 * 발견 시: 마킹 + 주변 안개 뻥(Civ st.) + 희귀도 XP + 축하.
 */
export function checkLandmarkDiscoveries(lat: number, lng: number): void {
  const near = getUndiscoveredLandmarksNear(
    lat,
    lng,
    CONFIG.LANDMARK_DISCOVER_RADIUS_M
  );
  if (near.length === 0) return;

  const now = Date.now();
  for (const lm of near) {
    const d = haversineMeters({ lat, lng }, { lat: lm.lat, lng: lm.lng });
    if (d > CONFIG.LANDMARK_DISCOVER_RADIUS_M) continue; // bbox → 실제 원형 거리로 보정
    discover(lm, now);
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

  // 축하 연출
  useAchievementStore.getState().celebrate({
    emoji: CATEGORY_EMOJI[lm.category] ?? '📍',
    title: discoverTitle(lm),
    subtitle: lm.name,
  });
}
