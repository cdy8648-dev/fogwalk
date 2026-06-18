import { CONFIG } from '../constants/config';
import { useAchievementStore } from '../store/achievementStore';
import { useUserStore } from '../store/userStore';
import { haversineMeters } from '../utils/distance';
import { modeWeight } from '../utils/mode';
import { levelProgress, xpForMovement } from '../utils/xp';
import { checkAchievements } from './achievements';
import {
  getDailyStatsByDate,
  getProgress,
  updateProgress,
  upsertDailyStats,
} from './db';

/**
 * 진행도(거리·스트릭) 도메인 로직. db(영속) + 순수 유틸 위에서 동작.
 * XP/필름 계산은 Phase 2B/2D에서 여기에 추가한다.
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

  // 필름: 가중 거리 기준 적립 (소수점 누적, 사용 시 1장 단위)
  const filmGain = (weighted / 1000) * CONFIG.FILM_PER_KM;

  updateProgress({
    totalDistanceM: p.totalDistanceM + segment,
    walkDistanceM: p.walkDistanceM + weighted,
    totalXp: p.totalXp + xpGain,
    film: p.film + filmGain,
    streak,
    lastExploreDate: lastDate,
    lastLat: lat,
    lastLng: lng,
  });

  if (segment > 0 || newTiles > 0) {
    upsertDailyStats(today, segment, newTiles);
  }
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
    film: p.film,
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

/** 필름 1장 소모 시도. 충분하면 차감하고 true. (사진 게시용) */
export function trySpendFilm(): boolean {
  const p = getProgress();
  if (p.film < 1) return false;
  updateProgress({ film: p.film - 1 });
  refreshProgressStore();
  return true;
}
