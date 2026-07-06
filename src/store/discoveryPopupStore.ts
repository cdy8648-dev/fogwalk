import { create } from 'zustand';

import type { Landmark } from '../types';

/**
 * 발견 보상 팝업 상태 (디자인: 02 발견 순간 → 03 발견 카드).
 * live=true(포그라운드 실시간): 02 연출 후 카드, 액션 버튼 있음.
 * live=false(백그라운드 복귀 요약): 02 생략, 카드만·버튼 없음·탭/스와이프로 넘김.
 */

/** 카드 1장: main(희귀 이상 상세) + '함께 발견' 일반 목록. main=null이면 일반만 담은 컴팩트 카드. */
export interface DiscoveryCardPage {
  main: Landmark | null;
  extras: Landmark[];
}

const TIER: Record<string, number> = { legendary: 3, epic: 2, rare: 1 };

/** 상세 풀 카드를 받는 등급인가 — 희귀 이상. 지하철은 등급 무관 도감 트랙(리스트 행). */
export function isDetailGrade(lm: Landmark): boolean {
  if (lm.category === 'subway') return false;
  return (TIER[lm.rarity ?? ''] ?? 0) > 0;
}

// 상세는 등급 내림차순으로 각 1장, 일반은 첫 카드의 '함께 발견'에 병합.
// 상세가 없으면 리스트만 담긴 컴팩트 카드 1장.
function buildPages(batch: Landmark[]): DiscoveryCardPage[] {
  const details = batch
    .filter(isDetailGrade)
    .sort((a, b) => (TIER[b.rarity ?? ''] ?? 0) - (TIER[a.rarity ?? ''] ?? 0));
  const commons = batch.filter((lm) => !isDetailGrade(lm));
  if (details.length === 0) return [{ main: null, extras: commons }];
  return details.map((d, i) => ({ main: d, extras: i === 0 ? commons : [] }));
}

interface DiscoveryPopupState {
  phase: 'moment' | 'cards' | null;
  live: boolean;
  hero: Landmark | null; // 02 연출 주인공(최고 등급)
  pages: DiscoveryCardPage[];
  showLive: (batch: Landmark[]) => void; // 포그라운드 발견(희귀 이상 포함 배치)
  showRecap: (batch: Landmark[]) => void; // 백그라운드 발견 복귀 요약
  advance: () => void; // 02 → 03
  dismiss: () => void;
}

export const useDiscoveryPopupStore = create<DiscoveryPopupState>((set) => ({
  phase: null,
  live: false,
  hero: null,
  pages: [],

  showLive: (batch) => {
    const pages = buildPages(batch);
    set({ phase: 'moment', live: true, hero: pages[0]?.main ?? null, pages });
  },

  showRecap: (batch) =>
    set({ phase: 'cards', live: false, hero: null, pages: buildPages(batch) }),

  advance: () => set({ phase: 'cards' }),

  dismiss: () => set({ phase: null, live: false, hero: null, pages: [] }),
}));
