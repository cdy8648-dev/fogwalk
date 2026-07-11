import { CONFIG } from '../constants/config';
import {
  KR_REGION_CENTER,
  regionAreaKm2,
  regionEnName,
  regionKey,
} from '../constants/regionAreas';
import { useAchievementStore } from '../store/achievementStore';
import { useLandmarkStore } from '../store/landmarkStore';
import { useRecapStore } from '../store/recapStore';
import type { Landmark } from '../types';
import { haversineMeters } from '../utils/distance';
import { cellCenter, TILE_AREA_KM2 } from '../utils/h3';
import { getRegionStats, getSetting, getVisitedTilesSince, setSetting } from './db';

/**
 * 탐험 일지(별자리 리캡) — 마지막 열람 이후 새로 밝힌 타일을 별자리 데이터로 요약.
 * 전부 화면 층(앱 열 때 1회 계산). 원시 기록은 visited_tiles.first_visited_at 재사용
 * — 배터리 헌장 3조("기록은 얇게, 해석은 나중에")의 표본.
 */

const SEEN_KEY = 'recap_last_seen_at';

export interface RecapPoint {
  lat: number;
  lng: number;
  ts: number;
}

export interface RecapData {
  since: number;
  until: number;
  points: RecapPoint[]; // 다운샘플된 별자리 점(시간순)
  tileCount: number;
  km: number;
  landmarks: Landmark[]; // 기간 내 발견(등급 높은 순, 상한 12)
  regionName: string | null; // '서울' 등 (KR만, 근접 판정)
  regionEn: string | null; // 'SEOUL'
  regionPct: string | null; // '3.4%' — KR 시/도 달성률
}

const TIER: Record<string, number> = { legendary: 3, epic: 2, rare: 1 };

function nearestRegion(lat: number, lng: number): string | null {
  let best: { key: string; m: number } | null = null;
  for (const [key, c] of Object.entries(KR_REGION_CENTER)) {
    const m = haversineMeters({ lat, lng }, c);
    if (!best || m < best.m) best = { key, m };
  }
  // 시/도 중심에서 120km 넘으면 한국 아님(해외) 취급
  return best && best.m < 120_000 ? best.key : null;
}

function buildRecap(): RecapData | null {
  const raw = getSetting(SEEN_KEY);
  if (raw == null) {
    // 최초 도입: 기존 히스토리 전체를 일지로 재생하지 않도록 기준점만 찍고 시작
    setSetting(SEEN_KEY, String(Date.now()));
    return null;
  }
  const since = Number(raw);
  const tiles = getVisitedTilesSince(since);
  if (tiles.length < CONFIG.RECAP_MIN_TILES) return null;

  // 거리(km): 전체 타일 중심을 시간순으로 잇되, 1km 초과 구간은 점프로 보고 제외
  const centers = tiles.map((t) => ({ ...cellCenter(t.tileId), ts: t.ts }));
  let meters = 0;
  for (let i = 1; i < centers.length; i++) {
    const d = haversineMeters(centers[i - 1], centers[i]);
    if (d <= CONFIG.PATH_FILL_MAX_M) meters += d;
  }

  // 별자리 점: 상한까지 균등 다운샘플(첫/끝 점 보존)
  const step = Math.max(1, Math.ceil(centers.length / CONFIG.RECAP_MAX_POINTS));
  const points: RecapPoint[] = centers.filter(
    (_, i) => i % step === 0 || i === centers.length - 1
  );

  // 기간 내 발견 랜드마크(등급 높은 순 → 같은 등급은 시간순)
  const until = Date.now();
  const landmarks = useLandmarkStore
    .getState()
    .discovered.filter((l) => (l.discoveredAt ?? 0) > since && (l.discoveredAt ?? 0) <= until)
    .sort(
      (a, b) =>
        (TIER[b.rarity ?? ''] ?? 0) - (TIER[a.rarity ?? ''] ?? 0) ||
        (a.discoveredAt ?? 0) - (b.discoveredAt ?? 0)
    )
    .slice(0, 12);

  // 지역 타이틀 + 달성률 (KR만)
  const mid = points[Math.floor(points.length / 2)];
  const region = nearestRegion(mid.lat, mid.lng);
  let regionPct: string | null = null;
  if (region) {
    const area = regionAreaKm2('KR', region);
    if (area) {
      const regionTiles = getRegionStats('KR')
        .filter((r) => regionKey(r.region) === region)
        .reduce((s, r) => s + r.tiles, 0);
      const pct = ((regionTiles * TILE_AREA_KM2) / area) * 100;
      regionPct = pct >= 10 ? `${Math.round(pct)}%` : pct < 0.05 ? '<0.1%' : `${pct.toFixed(1)}%`;
    }
  }

  return {
    since,
    until,
    points,
    tileCount: tiles.length,
    km: meters / 1000,
    landmarks,
    regionName: region,
    regionEn: region ? regionEnName('KR', region) : null,
    regionPct,
  };
}

// 도착 토스트 중복 방지(프로세스 내)
let notifiedUntil = 0;

/** 앱 시작/활성화 시 호출 — 일지가 쌓였으면 편지함에 올리고 도착 토스트 1회. */
export function checkRecap(): void {
  const store = useRecapStore.getState();
  if (store.playing) return; // 재생 중엔 재계산하지 않음
  const data = buildRecap();
  if (!data) return;
  store.setAvailable(data);
  if (data.until > notifiedUntil) {
    notifiedUntil = data.until;
    useAchievementStore.getState().celebrate({
      emoji: '💌',
      title: '탐험 일지가 도착했어요!',
      subtitle: '편지함에서 이번 여정의 별자리를 확인하세요',
    });
  }
}

/** '보상 받기'로 열람 완료 — 다음 일지는 이 시점 이후 타일부터. */
export function markRecapSeen(until: number): void {
  setSetting(SEEN_KEY, String(until));
}
