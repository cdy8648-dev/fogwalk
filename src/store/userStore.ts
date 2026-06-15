import { create } from 'zustand';

interface UserState {
  streak: number;
  lastExploreDate: string | null; // 'YYYY-MM-DD'
  totalDistanceM: number;

  updateStreak: (date: string) => void;
  addDistance: (meters: number) => void;
  addTiles: (count: number) => void;
}

/** 'YYYY-MM-DD' 두 날짜의 일(day) 차이. */
function dayDiff(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86_400_000);
}

export const useUserStore = create<UserState>((set) => ({
  streak: 0,
  lastExploreDate: null,
  totalDistanceM: 0,

  updateStreak: (date) =>
    set((state) => {
      if (state.lastExploreDate === date) return state; // 같은 날 → 변화 없음
      if (state.lastExploreDate === null) {
        return { streak: 1, lastExploreDate: date };
      }
      const diff = dayDiff(state.lastExploreDate, date);
      const streak = diff === 1 ? state.streak + 1 : 1; // 연속이면 +1, 끊기면 1로 리셋
      return { streak, lastExploreDate: date };
    }),

  addDistance: (meters) =>
    set((state) => ({ totalDistanceM: state.totalDistanceM + meters })),

  // 타일 수 집계는 Phase 1 에서 채운다. 지금은 액션 껍데기만 둔다.
  addTiles: (_count) => set((state) => state),
}));
