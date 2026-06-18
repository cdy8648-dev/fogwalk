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
  unlock: (type: string, celebration: Celebration) => void;
  celebrate: (celebration: Celebration) => void; // 레벨업 등 type 없는 축하
  dismiss: () => void;
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
  unlockedTypes: new Set<string>(),
  queue: [],

  hydrate: () =>
    set({ unlockedTypes: new Set(getAllAchievements().map((a) => a.type)) }),

  unlock: (type, celebration) => {
    if (get().unlockedTypes.has(type)) return;
    set((state) => {
      const next = new Set(state.unlockedTypes);
      next.add(type);
      return { unlockedTypes: next, queue: [...state.queue, celebration] };
    });
  },

  celebrate: (celebration) =>
    set((state) => ({ queue: [...state.queue, celebration] })),

  dismiss: () => set((state) => ({ queue: state.queue.slice(1) })),
}));
