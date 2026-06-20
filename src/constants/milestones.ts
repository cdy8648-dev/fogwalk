// 밝힌 칸(타일) 기반 목표 마일스톤. 거리 대신 "발견한 칸" 수로 진행.
// 50 → 100 → 500 → 1000 … 식으로 상향.
export interface MilestoneDef {
  tiles: number; // 누적 밝힌 칸 임계값
  emoji: string;
  label: string; // 노드에 표기할 짧은 라벨
}

export const TILE_MILESTONES: MilestoneDef[] = [
  { tiles: 50, emoji: '👣', label: '50' },
  { tiles: 100, emoji: '🗺️', label: '100' },
  { tiles: 500, emoji: '🧭', label: '500' },
  { tiles: 1000, emoji: '🏆', label: '1K' },
  { tiles: 5000, emoji: '👑', label: '5K' },
  { tiles: 10000, emoji: '🌍', label: '10K' },
];

export interface MilestoneState {
  idx: number; // 현재(진행 중) 마일스톤 인덱스
  maxed: boolean; // 마지막 마일스톤까지 모두 달성
  prev: number; // 직전 임계값(0부터)
  target: number; // 현재 목표 임계값
  ratio: number; // 현재 구간 진행률 0..1
}

/** 현재 밝힌 칸 수로 마일스톤 진행 상태 계산. */
export function milestoneState(tiles: number): MilestoneState {
  let idx = TILE_MILESTONES.findIndex((m) => tiles < m.tiles);
  const maxed = idx === -1;
  if (maxed) idx = TILE_MILESTONES.length - 1;
  const prev = idx > 0 ? TILE_MILESTONES[idx - 1].tiles : 0;
  const target = TILE_MILESTONES[idx].tiles;
  const ratio = maxed ? 1 : Math.min(1, Math.max(0, (tiles - prev) / (target - prev)));
  return { idx, maxed, prev, target, ratio };
}
