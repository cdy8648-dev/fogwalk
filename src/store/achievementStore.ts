import { create } from 'zustand';

import { getAllAchievements } from '../services/db';

/** 화면에 띄울 축하(뱃지 획득/레벨업)의 표시 데이터. */
export interface Celebration {
  emoji: string;
  title: string;
  subtitle?: string;
}

interface AchievementState {
  unlockedTypes: Set<string>; // 해금된 업적 type (중복 방지)
  queue: Celebration[]; // 표시 대기열
  hydrate: () => void;
  markUnlocked: (type: string) => void; // 해금 집합에만 추가(축하는 별도)
  celebrate: (celebration: Celebration) => void; // 축하 큐에 적재
  dismiss: () => void;
}

export const useAchievementStore = create<AchievementState>((set) => ({
  unlockedTypes: new Set<string>(),
  queue: [],

  hydrate: () =>
    set({ unlockedTypes: new Set(getAllAchievements().map((a) => a.type)) }),

  markUnlocked: (type) =>
    set((state) => {
      if (state.unlockedTypes.has(type)) return state;
      const next = new Set(state.unlockedTypes);
      next.add(type);
      return { unlockedTypes: next };
    }),

  celebrate: (celebration) =>
    set((state) => ({ queue: [...state.queue, celebration] })),

  dismiss: () => set((state) => ({ queue: state.queue.slice(1) })),
}));
