import { CONFIG } from '../constants/config';

/**
 * XP·레벨 순수 함수.
 * 레벨 L 시작 누적 XP = 50·L·(L-1)  → 레벨 L→L+1 에 필요한 양 = 100·L (점증).
 */

/** 이동 1건의 XP. 거리/타일은 이미 이동수단 가중이 적용된 값을 받는다. */
export function xpForMovement(
  weightedDistanceM: number,
  weightedNewTiles: number,
  streak: number
): number {
  const base =
    (weightedDistanceM / 1000) * CONFIG.XP_PER_KM +
    weightedNewTiles * CONFIG.XP_PER_TILE;
  const bonus = Math.min(
    streak * CONFIG.XP_STREAK_BONUS_PER_DAY,
    CONFIG.XP_STREAK_BONUS_MAX
  );
  return base * (1 + bonus);
}

function levelStartXp(level: number): number {
  return 50 * level * (level - 1);
}

/** 누적 XP → 레벨 (최소 1). */
export function levelForXp(totalXp: number): number {
  if (totalXp <= 0) return 1;
  return Math.max(1, Math.floor((50 + Math.sqrt(2500 + 200 * totalXp)) / 100));
}

/** 레벨 게이지용 진행도. */
export function levelProgress(totalXp: number): {
  level: number;
  intoLevel: number;
  span: number;
  ratio: number;
} {
  const level = levelForXp(totalXp);
  const start = levelStartXp(level);
  const span = levelStartXp(level + 1) - start; // = 100·level
  const intoLevel = Math.max(0, totalXp - start);
  return { level, intoLevel, span, ratio: span > 0 ? intoLevel / span : 0 };
}
