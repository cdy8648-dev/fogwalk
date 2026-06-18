import type { DailyStats } from '../types';

export interface HeatCell {
  date: string;
  distanceM: number;
  newTiles: number;
}

/** 로컬 'YYYY-MM-DD'. */
export function localDateStr(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * 최근 `weeks`주 히트맵. 열 = 주(일요일 시작), 행 = 요일(0=일~6=토).
 * 마지막 주는 오늘까지만 채워지므로 일부 칸은 undefined일 수 있다.
 */
export function buildHeatmapWeeks(
  stats: DailyStats[],
  weeks: number
): (HeatCell | undefined)[][] {
  const map = new Map(stats.map((s) => [s.date, s]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(start.getDate() - (weeks * 7 - 1));
  start.setDate(start.getDate() - start.getDay()); // 일요일로 정렬

  const cols: (HeatCell | undefined)[][] = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    const idx = Math.round((cursor.getTime() - start.getTime()) / 86_400_000);
    const wk = Math.floor(idx / 7);
    const dow = cursor.getDay();
    if (!cols[wk]) cols[wk] = new Array<HeatCell | undefined>(7).fill(undefined);
    const s = map.get(localDateStr(cursor));
    cols[wk][dow] = {
      date: localDateStr(cursor),
      distanceM: s?.distanceM ?? 0,
      newTiles: s?.newTiles ?? 0,
    };
    cursor.setDate(cursor.getDate() + 1);
  }
  return cols;
}

/** 누적 신규타일 시계열 (항상 우상향). */
export function buildCumulativeTiles(
  stats: DailyStats[]
): { date: string; cum: number }[] {
  let sum = 0;
  return stats.map((s) => {
    sum += s.newTiles;
    return { date: s.date, cum: sum };
  });
}
