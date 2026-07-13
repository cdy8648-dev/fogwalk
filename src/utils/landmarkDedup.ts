import type { Landmark } from '../types';
import { haversineMeters } from './distance';

/**
 * 발견 랜드마크 표시용 중복 제거.
 * OSM은 같은 장소를 여러 요소로 태그한다(예: 수서역 = SRT 역사 way + 지하철 node들).
 * osm_id가 달라 DB엔 각각 저장되지만, 화면엔 하나로 보여야 한다.
 * 같은 정규화 이름 + 근접(radiusM) 이면 첫 발견분만 남긴다. DB·XP는 건드리지 않는다.
 */
function norm(s: string): string {
  return s.replace(/\s+/g, '').toLowerCase();
}

export function dedupLandmarks(list: Landmark[], radiusM = 500): Landmark[] {
  // 이른 발견 우선 유지 (원본 순서와 무관하게 결정적)
  const sorted = [...list].sort((a, b) => (a.discoveredAt ?? 0) - (b.discoveredAt ?? 0));
  const groups = new Map<string, Landmark[]>();
  const keep: Landmark[] = [];
  for (const lm of sorted) {
    const key = norm(lm.name);
    const g = groups.get(key);
    if (g && g.some((x) => haversineMeters(x, lm) < radiusM)) continue; // 같은 이름·근접 = 중복
    if (g) g.push(lm);
    else groups.set(key, [lm]);
    keep.push(lm);
  }
  return keep;
}
