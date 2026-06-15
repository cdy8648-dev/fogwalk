import { create } from 'zustand';

import type { Achievement } from '../types';

interface AchievementState {
  unlockedIds: Set<string>;
  pendingNotification: Achievement | null;

  unlock: (achievement: Achievement) => void;
  clearNotification: () => void;
}

export const useAchievementStore = create<AchievementState>((set) => ({
  unlockedIds: new Set<string>(),
  pendingNotification: null,

  unlock: (achievement) =>
    set((state) => {
      if (state.unlockedIds.has(achievement.id)) return state;
      const next = new Set(state.unlockedIds);
      next.add(achievement.id);
      return { unlockedIds: next, pendingNotification: achievement };
    }),
  clearNotification: () => set({ pendingNotification: null }),
}));
