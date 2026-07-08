import { AppState } from 'react-native';

import { BADGES, type BadgeAxis, type BadgeDef, type BadgeMetricKey } from '../constants/badges';
import { matchCurated } from '../constants/curatedLandmarks';
import { regionKey } from '../constants/regionAreas';
import { useAchievementStore } from '../store/achievementStore';
import { useDiscoveryPopupStore } from '../store/discoveryPopupStore';
import { useMapStore } from '../store/mapStore';
import { useUserStore } from '../store/userStore';
import type { Landmark } from '../types';
import { levelProgress } from '../utils/xp';
import {
  getAllPhotos,
  getDiscoveredLandmarks,
  getProgress,
  getRegionStats,
  getSetting,
  insertAchievement,
  setSetting,
  updateProgress,
} from './db';

/**
 * 뱃지 판정 — 이벤트 기반. 트리거에 해당하는 축의 미획득 뱃지만 검사한다.
 * 뱃지 정의는 constants/badges.ts(데이터). 여기선 현재값을 읽어 threshold 와 비교만.
 */

export type BadgeTrigger = 'progress' | 'discover' | 'photo';

// 트리거 → 검사할 축. (first 축은 여러 트리거에 걸쳐 있어도 무해 — 이미 획득분은 스킵)
const TRIGGER_AXES: Record<BadgeTrigger, BadgeAxis[]> = {
  progress: ['first', 'distance', 'streak', 'area'],
  discover: ['first', 'discover', 'collection'],
  photo: ['first'],
};

interface BadgeMetrics {
  tiles: number;
  distanceKm: number;
  streak: number;
  photos: number;
  discovered: number;
  legendary: number;
  unesco: number;
  seoulTiles: number;
  cat: Record<string, number>;
}

/** 유네스코 세계유산 발견인가 (큐레이션 unesco 플래그, 없으면 비큐레이션 전설=자동 유네스코). */
function isUnesco(lm: Landmark): boolean {
  const c = matchCurated(lm.qid, lm.name);
  return c ? !!c.unesco : lm.rarity === 'legendary';
}

/** 후보 뱃지가 요구하는 지표만 골라 계산 (불필요한 DB 조회 회피). */
function computeMetrics(keys: Set<BadgeMetricKey>): BadgeMetrics {
  const m: BadgeMetrics = {
    tiles: 0, distanceKm: 0, streak: 0, photos: 0,
    discovered: 0, legendary: 0, unesco: 0, seoulTiles: 0, cat: {},
  };
  const needDiscovered =
    keys.has('discovered') || keys.has('legendary') || keys.has('unesco') ||
    [...keys].some((k) => k.startsWith('cat:'));

  if (keys.has('distanceKm') || keys.has('streak')) {
    const p = getProgress();
    m.distanceKm = p.totalDistanceM / 1000;
    m.streak = p.streak;
  }
  if (keys.has('tiles')) m.tiles = useMapStore.getState().visitedTileIds.size;
  if (keys.has('seoulTiles')) {
    // region 표기는 reverseGeocode 라 흔들림('서울특별시'/'서울') → 정규화 키로 합산
    m.seoulTiles = getRegionStats('KR')
      .filter((r) => regionKey(r.region) === '서울')
      .reduce((sum, r) => sum + r.tiles, 0);
  }
  if (keys.has('photos')) m.photos = getAllPhotos().length;
  if (needDiscovered) {
    for (const lm of getDiscoveredLandmarks()) {
      m.discovered++;
      m.cat[lm.category] = (m.cat[lm.category] ?? 0) + 1;
      if (lm.rarity === 'legendary') m.legendary++;
      if (isUnesco(lm)) m.unesco++;
    }
  }
  return m;
}

// 도감 화면용: 모든 지표를 한 번에 계산.
const ALL_KEYS = new Set<BadgeMetricKey>(BADGES.map((b) => b.metric));
export function badgeMetricsSnapshot(): BadgeMetrics {
  return computeMetrics(ALL_KEYS);
}
export type { BadgeMetrics };

export function badgeCurrentValue(metric: BadgeMetricKey, m: BadgeMetrics): number {
  return currentValue(metric, m);
}

function currentValue(metric: BadgeMetricKey, m: BadgeMetrics): number {
  switch (metric) {
    case 'tiles': return m.tiles;
    case 'distanceKm': return m.distanceKm;
    case 'streak': return m.streak;
    case 'photos': return m.photos;
    case 'discovered': return m.discovered;
    case 'legendary': return m.legendary;
    case 'unesco': return m.unesco;
    case 'seoulTiles': return m.seoulTiles;
    default: return m.cat[metric.slice(4)] ?? 0; // 'cat:palace' → cat.palace
  }
}

/** 뱃지 XP 보상: DB 반영 + userStore(레벨/게이지) 즉시 동기화 (재귀 refresh 없이). */
function awardXp(amount: number): void {
  const total = getProgress().totalXp + amount;
  updateProgress({ totalXp: total });
  const prog = levelProgress(total);
  useUserStore.setState({ totalXp: total, level: prog.level, levelRatio: prog.ratio });
}

// 팝업으로 못 보여준 획득분(백그라운드 등) — 프로세스가 죽어도 복귀 시 보여주도록 DB에 영속
const PENDING_POPUP_KEY = 'pending_badge_popups';

function readPendingIds(): string[] {
  try {
    const raw = getSetting(PENDING_POPUP_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** 대기 중인 뱃지 획득 카드를 보상 팝업 스택에 올린다. 앱 시작·활성화·해금 직후 호출. */
export function flushPendingBadgePopups(): void {
  const ids = readPendingIds();
  if (ids.length === 0) return;
  setSetting(PENDING_POPUP_KEY, '[]');
  const defs = ids
    .map((id) => BADGES.find((b) => b.id === id))
    .filter((b): b is BadgeDef => b != null);
  if (defs.length) useDiscoveryPopupStore.getState().enqueueBadges(defs);
}

/**
 * 이벤트 발생 시 관련 축의 미획득 뱃지만 검사 → 달성분 해금(DB+스토어+XP+보상 팝업).
 * 이미 획득한 뱃지는 재획득/재알림하지 않는다. 획득 카드는 발견 팝업과 같은 스택에 쌓이고,
 * 백그라운드 해금분은 pending 큐(DB)로 남겨 앱을 켰을 때 보여준다.
 */
export function checkBadges(trigger: BadgeTrigger): void {
  const store = useAchievementStore.getState();
  const axes = TRIGGER_AXES[trigger];
  const candidates = BADGES.filter(
    (b) => axes.includes(b.axis) && !store.unlockedTypes.has(b.id)
  );
  if (candidates.length === 0) return;

  const m = computeMetrics(new Set(candidates.map((b) => b.metric)));
  const now = Date.now();
  let xpAward = 0;
  const fresh: string[] = [];

  for (const b of candidates) {
    if (currentValue(b.metric, m) < b.threshold) continue;
    // DB에 실제로 새로 들어갔을 때만 보상 (백그라운드 재실행에서 중복 방지)
    const isNew = insertAchievement({
      id: b.id, type: b.id, value: String(b.threshold), unlockedAt: now,
    });
    store.markUnlocked(b.id);
    if (isNew) {
      xpAward += b.xpReward;
      fresh.push(b.id);
    }
  }
  if (xpAward > 0) awardXp(xpAward);

  if (fresh.length) {
    setSetting(PENDING_POPUP_KEY, JSON.stringify([...readPendingIds(), ...fresh]));
    // 포그라운드면 즉시 팝업, 백그라운드면 pending 으로 남겨 복귀 시 표시
    if (AppState.currentState === 'active') flushPendingBadgePopups();
  }
}
