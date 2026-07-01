import { create } from 'zustand';

/** 진행도 표시 스냅샷 (영속 원본은 DB progress 테이블, 여기는 렌더용 캐시). */
export interface ProgressSnapshot {
  totalDistanceM: number;
  walkDistanceM: number;
  streak: number;
  todayDistanceM: number;
  todayNewTiles: number;
  totalXp: number;
  level: number;
  levelRatio: number; // 현재 레벨 내 진행도 0..1 (게이지용)
  ink: number; // 잉크 잔량(소비형 통화)
}

interface UserState extends ProgressSnapshot {
  setProgress: (snapshot: ProgressSnapshot) => void;
}

export const useUserStore = create<UserState>((set) => ({
  totalDistanceM: 0,
  walkDistanceM: 0,
  streak: 0,
  todayDistanceM: 0,
  todayNewTiles: 0,
  totalXp: 0,
  level: 1,
  levelRatio: 0,
  ink: 0,
  setProgress: (snapshot) => set(snapshot),
}));
