import type { DailyStats } from '../types';

/** 로컬 'YYYY-MM-DD'. */
export function localDateStr(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export interface CalCell {
  day: number;
  date: string; // 'YYYY-MM-DD'
  distanceM: number;
  newTiles: number;
}

/**
 * 특정 월(month: 0~11) 캘린더 그리드. 주(일요일 시작) × 요일. 빈 칸은 null.
 */
export function buildMonthCalendar(
  stats: DailyStats[],
  year: number,
  month: number
): (CalCell | null)[][] {
  const map = new Map(stats.map((s) => [s.date, s]));
  const startDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weeks: (CalCell | null)[][] = [];
  let week: (CalCell | null)[] = new Array<CalCell | null>(startDow).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const s = map.get(date);
    week.push({ day: d, date, distanceM: s?.distanceM ?? 0, newTiles: s?.newTiles ?? 0 });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

export interface MonthStat {
  ym: string; // 'YYYY-MM'
  distanceM: number;
  newTiles: number;
}

/** 일별 통계를 월별로 합산. 최신 월이 먼저(내림차순). */
export function buildMonthlyHistory(stats: DailyStats[]): MonthStat[] {
  const map = new Map<string, MonthStat>();
  for (const s of stats) {
    const ym = s.date.slice(0, 7);
    const cur = map.get(ym) ?? { ym, distanceM: 0, newTiles: 0 };
    cur.distanceM += s.distanceM;
    cur.newTiles += s.newTiles;
    map.set(ym, cur);
  }
  return [...map.values()].sort((a, b) => (a.ym < b.ym ? 1 : -1));
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
