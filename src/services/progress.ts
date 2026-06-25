import { CONFIG } from '../constants/config';
import { useAchievementStore } from '../store/achievementStore';
import { useUserStore } from '../store/userStore';
import { haversineMeters } from '../utils/distance';
import { modeWeight } from '../utils/mode';
import { levelProgress, xpForMovement } from '../utils/xp';
import { checkAchievements } from './achievements';
import { ensureCountry, getCurrentCountry } from './country';
import { checkLandmarkDiscoveries } from './discovery';
import { ensureLandmarksFetched } from './landmarks';
import {
  getDailyStatsByDate,
  getProgress,
  updateProgress,
  upsertCountryTiles,
  upsertDailyStats,
} from './db';

/**
 * 진행도(거리·스트릭) 도메인 로직. db(영속) + 순수 유틸 위에서 동작.
 * XP 계산은 utils/xp.ts 의 순수 함수로 위임한다.
 */

/** 로컬 'YYYY-MM-DD'. */
function todayStr(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function dayDiff(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

/**
 * 위치 1건 기록: 직전 지점 대비 거리 누적(끊김 가드) + 속도 가중 + 일별통계 + 스트릭.
 * 안개 reveal(타일)은 호출 전에 따로 처리하고, 신규 타일 수만 넘겨받는다.
 */
export function recordMovement(
  lat: number,
  lng: number,
  speed: number | null,
  newTiles: number
): void {
  const p = getProgress();

  let segment = 0;
  if (p.lastLat != null && p.lastLng != null) {
    segment = haversineMeters(
      { lat: p.lastLat, lng: p.lastLng },
      { lat, lng }
    );
    if (segment > CONFIG.MAX_SEGMENT_M) segment = 0; // 긴 점프 = 추적 끊김 → 거리 제외
  }
  const w = modeWeight(speed);
  const weighted = segment * w;

  // 실제 이동(segment>0)이 있은 날만 스트릭 갱신 — 너그럽게(차량 포함)
  const today = todayStr();
  let streak = p.streak;
  let lastDate = p.lastExploreDate;
  if (segment > 0 && lastDate !== today) {
    if (lastDate == null) streak = 1;
    else streak = dayDiff(lastDate, today) === 1 ? streak + 1 : 1;
    lastDate = today;
  }

  // XP: 가중 거리 + 가중 신규타일 (+ 스트릭 보너스). 차량은 가중이 낮아 XP도 적게.
  const xpGain = xpForMovement(weighted, newTiles * w, streak);

  updateProgress({
    totalDistanceM: p.totalDistanceM + segment,
    walkDistanceM: p.walkDistanceM + weighted,
    totalXp: p.totalXp + xpGain,
    streak,
    lastExploreDate: lastDate,
    lastLat: lat,
    lastLng: lng,
  });

  if (segment > 0 || newTiles > 0) {
    upsertDailyStats(today, segment, newTiles);
  }

  // 새 지역이면 랜드마크 OSM 조회(비동기, 캐싱)
  void ensureLandmarksFetched(lat, lng);

  // 여권: 신규 타일을 현재 국가에 적립 (국가 판별은 비동기로 캐시 갱신)
  void ensureCountry(lat, lng);
  if (newTiles > 0) {
    const country = getCurrentCountry();
    if (country) upsertCountryTiles(country.code, country.name, newTiles);
  }

  // 랜드마크 발견 체크 (근처 미발견 → 발견 + 안개 뻥 + 보상)
  checkLandmarkDiscoveries(lat, lng);
}

/** DB의 진행도를 userStore(표시용)로 반영. 앱 시작/포그라운드 복귀/이동 후 호출. */
/**
 * DB 진행도 → userStore 반영 + 뱃지 체크.
 * celebrateLevelUp=true(이동 컨텍스트)일 때만 레벨업 축하를 띄운다
 * (앱 시작/동기화 시 1→실제레벨 점프를 축하로 오인하지 않도록).
 */
export function refreshProgressStore(celebrateLevelUp = false): void {
  const p = getProgress();
  const today = getDailyStatsByDate(todayStr());
  const prog = levelProgress(p.totalXp);
  const prevLevel = useUserStore.getState().level;

  useUserStore.getState().setProgress({
    totalDistanceM: p.totalDistanceM,
    walkDistanceM: p.walkDistanceM,
    streak: p.streak,
    todayDistanceM: today?.distanceM ?? 0,
    todayNewTiles: today?.newTiles ?? 0,
    totalXp: p.totalXp,
    level: prog.level,
    levelRatio: prog.ratio,
  });

  if (celebrateLevelUp && prog.level > prevLevel) {
    useAchievementStore.getState().celebrate({
      emoji: '⭐',
      title: `레벨 ${prog.level} 달성!`,
      subtitle: '계속 탐험해보세요',
    });
  }

  checkAchievements();
}
