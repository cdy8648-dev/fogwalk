import { create } from 'zustand';

import type { BadgeDef } from '../constants/badges';
import type { Landmark } from '../types';

/**
 * 보상 팝업 상태 (디자인: 02 발견 순간 → 03 카드 스택).
 * 카드는 랜드마크 발견과 뱃지 획득이 한 스택에 섞인다(틴더 스와이프).
 * live=true(포그라운드 실시간): 02 연출 후 카드, 랜드마크 카드에 액션 버튼.
 * live=false(복귀 요약): 02 생략, 카드만.
 */

export type PopupPage =
  | { kind: 'landmark'; main: Landmark | null; extras: Landmark[] }
  | { kind: 'badge'; badge: BadgeDef };

const TIER: Record<string, number> = { legendary: 3, epic: 2, rare: 1 };

/** 상세 풀 카드를 받는 등급인가 — 희귀 이상. 지하철은 등급 무관 도감 트랙(리스트 행). */
export function isDetailGrade(lm: Landmark): boolean {
  if (lm.category === 'subway') return false;
  return (TIER[lm.rarity ?? ''] ?? 0) > 0;
}

// 상세는 등급 내림차순으로 각 1장, 일반은 첫 카드의 '함께 발견'에 병합.
// 상세가 없으면 리스트만 담긴 컴팩트 카드 1장.
function buildLandmarkPages(batch: Landmark[]): PopupPage[] {
  const details = batch
    .filter(isDetailGrade)
    .sort((a, b) => (TIER[b.rarity ?? ''] ?? 0) - (TIER[a.rarity ?? ''] ?? 0));
  const commons = batch.filter((lm) => !isDetailGrade(lm));
  if (details.length === 0) return [{ kind: 'landmark', main: null, extras: commons }];
  return details.map((d, i) => ({
    kind: 'landmark',
    main: d,
    extras: i === 0 ? commons : [],
  }));
}

interface DiscoveryPopupState {
  phase: 'moment' | 'cards' | null;
  live: boolean;
  hero: Landmark | null; // 02 연출 주인공(최고 등급)
  pages: PopupPage[];
  showLive: (batch: Landmark[]) => void; // 포그라운드 발견 — 랜드마크 카드를 앞에, 대기 중 뱃지 카드는 뒤에 유지
  showRecap: (batch: Landmark[]) => void; // 백그라운드 발견 복귀 요약
  enqueueBadges: (badges: BadgeDef[]) => void; // 뱃지 카드를 끝에 추가 (닫혀 있으면 열기)
  advance: () => void; // 02 → 03
  dismiss: () => void;
}

export const useDiscoveryPopupStore = create<DiscoveryPopupState>((set) => ({
  phase: null,
  live: false,
  hero: null,
  pages: [],

  showLive: (batch) =>
    set((s) => {
      const lmPages = buildLandmarkPages(batch);
      const hero = lmPages[0]?.kind === 'landmark' ? lmPages[0].main : null;
      // 이미 큐에 있던 뱃지 카드(발견 순간 함께 해금분)는 랜드마크 뒤에 유지
      const badgePages = s.pages.filter((p) => p.kind === 'badge');
      return { phase: 'moment', live: true, hero, pages: [...lmPages, ...badgePages] };
    }),

  showRecap: (batch) =>
    set((s) => {
      const badgePages = s.pages.filter((p) => p.kind === 'badge');
      return {
        phase: 'cards',
        live: s.phase != null ? s.live : false,
        hero: null,
        pages: [...buildLandmarkPages(batch), ...badgePages],
      };
    }),

  enqueueBadges: (badges) =>
    set((s) => {
      const queued = new Set(
        s.pages.filter((p) => p.kind === 'badge').map((p) => p.badge.id)
      );
      const add: PopupPage[] = badges
        .filter((b) => !queued.has(b.id))
        .map((b) => ({ kind: 'badge', badge: b }));
      if (add.length === 0) return s;
      return {
        ...s,
        phase: s.phase ?? 'cards', // 닫혀 있으면 카드로 바로 열기 (02 연출은 발견 전용)
        pages: [...s.pages, ...add],
      };
    }),

  advance: () => set({ phase: 'cards' }),

  dismiss: () => set({ phase: null, live: false, hero: null, pages: [] }),
}));
