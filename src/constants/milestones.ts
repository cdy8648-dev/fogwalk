// 밝힌 칸(타일) 기반 "등급 승급" 시스템.
// 10개 등급, 각 등급 4개 노드(목표 칸). 한 등급의 4노드를 모두 달성하면 다음 등급으로 승급.
// 판정: services/UI 는 tierState() 로 현재 등급/노드 상태를 읽는다(임계값 하드코딩 금지).
import { abbrev } from '../utils/format';

export interface TileGrade {
  grade: number; // 1..10
  name: string; // 등급명
  scaleLabel: string; // 스케일 감각 (예: '서울 면적')
  area: string; // 면적 환산 (예: '~825km²')
  nodes: readonly [number, number, number, number]; // 오름차순 목표 칸 4개
}

// 매 단계 ≈×1.3~1.4 성장(초반은 빠른 성취). 40K≈서울 면적, 6.6M≈남한 전체 앵커.
export const TILE_GRADES: readonly TileGrade[] = [
  { grade: 1, name: '새싹 탐험가', scaleLabel: '집 주변', area: '~5km²', nodes: [50, 100, 200, 350] },
  { grade: 2, name: '동네 산책자', scaleLabel: '우리 동네', area: '~23km²', nodes: [500, 700, 1000, 1500] },
  { grade: 3, name: '골목 정복자', scaleLabel: '여러 동네', area: '~90km²', nodes: [2000, 3000, 4000, 6000] },
  { grade: 4, name: '거리의 개척자', scaleLabel: '구 단위', area: '~270km²', nodes: [8000, 10000, 13000, 18000] },
  { grade: 5, name: '도시 탐험가', scaleLabel: '서울 면적', area: '~825km²', nodes: [25000, 32000, 40000, 55000] },
  { grade: 6, name: '광역 순례자', scaleLabel: '수도권', area: '~2,400km²', nodes: [70000, 90000, 120000, 160000] },
  { grade: 7, name: '원정가', scaleLabel: '광역 원정', area: '~7,500km²', nodes: [200000, 280000, 380000, 500000] },
  { grade: 8, name: '대탐험가', scaleLabel: '100만 돌파', area: '~2.3만km²', nodes: [650000, 850000, 1100000, 1500000] },
  { grade: 9, name: '전설의 방랑자', scaleLabel: '전국구', area: '~6.8만km²', nodes: [2000000, 2700000, 3500000, 4500000] },
  { grade: 10, name: '지도를 삼킨 자', scaleLabel: '남한~한반도', area: '~22.5만km²', nodes: [6000000, 8000000, 11000000, 15000000] },
];

/** 평평한 임계값(오름차순 40개) — 이전 노드/진행률 계산용. */
export const TILE_THRESHOLDS: readonly number[] = TILE_GRADES.flatMap((g) => g.nodes);

export type NodeStatus = 'done' | 'current' | 'locked';

export interface TileNodeState {
  tiles: number;
  label: string; // K/M 축약
  status: NodeStatus;
}

export interface TierState {
  tiles: number;
  grade: number; // 현재 등급 번호 1..10
  gradeIndex: number; // 0..9
  gradeDef: TileGrade;
  nextGrade: TileGrade | null; // 승급 대상 (없으면 최고 등급)
  nodes: TileNodeState[]; // 현재 등급 4노드 상태
  doneCount: number; // 달성 노드 수 0..4 (링 게이지 = doneCount/4)
  maxed: boolean; // 최고 등급(10)의 마지막 노드까지 모두 달성
  currentNode: number | null; // 현재 진행 목표 노드값 (null = 등급 내 전부 달성)
  prevThreshold: number; // 진행 바 하한(직전 노드값, 없으면 0)
  ratio: number; // 현재 구간 진행률 0..1
}

/**
 * 현재 밝힌 칸 수로 등급/노드 상태 계산.
 * - 등급 = 밝힌칸이 마지막 노드 미만인 첫 등급(초과 시 다음 등급으로 승급).
 * - 각 노드: 밝힌칸 ≥ 노드값 → 달성 / 아직 안 지난 첫 노드 → 현재 / 그 이후 → 잠금.
 */
export function tierState(tiles: number): TierState {
  let gradeIndex = TILE_GRADES.findIndex((g) => tiles < g.nodes[g.nodes.length - 1]);
  const beyondAll = gradeIndex === -1; // 마지막 등급 마지막 노드까지 넘김
  if (beyondAll) gradeIndex = TILE_GRADES.length - 1;
  const gradeDef = TILE_GRADES[gradeIndex];

  const currentIdx = gradeDef.nodes.findIndex((n) => tiles < n); // 아직 안 지난 첫 노드(-1=전부 달성)
  const nodes: TileNodeState[] = gradeDef.nodes.map((n, i) => ({
    tiles: n,
    label: abbrev(n),
    status: tiles >= n ? 'done' : i === currentIdx ? 'current' : 'locked',
  }));
  const doneCount = nodes.filter((n) => n.status === 'done').length;

  let currentNode: number | null = null;
  let prevThreshold = 0;
  let ratio = 1;
  if (currentIdx !== -1) {
    currentNode = gradeDef.nodes[currentIdx];
    const flatIdx = TILE_THRESHOLDS.indexOf(currentNode);
    prevThreshold = flatIdx > 0 ? TILE_THRESHOLDS[flatIdx - 1] : 0;
    ratio = Math.min(1, Math.max(0, (tiles - prevThreshold) / (currentNode - prevThreshold)));
  }

  return {
    tiles,
    grade: gradeDef.grade,
    gradeIndex,
    gradeDef,
    nextGrade: gradeIndex < TILE_GRADES.length - 1 ? TILE_GRADES[gradeIndex + 1] : null,
    nodes,
    doneCount,
    maxed: beyondAll,
    currentNode,
    prevThreshold,
    ratio,
  };
}

// ── 하위 호환: ProfileScreen '다음 목표까지 %' (maxed·ratio 만 사용) ──────────
export interface MilestoneState {
  maxed: boolean;
  target: number;
  prev: number;
  ratio: number;
}

/** @deprecated 새 UI 는 tierState() 사용. ProfileScreen 진행률 표기용으로만 유지. */
export function milestoneState(tiles: number): MilestoneState {
  const t = tierState(tiles);
  return {
    maxed: t.maxed,
    target: t.currentNode ?? TILE_THRESHOLDS[TILE_THRESHOLDS.length - 1],
    prev: t.prevThreshold,
    ratio: t.ratio,
  };
}
