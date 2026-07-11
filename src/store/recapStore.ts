import { create } from 'zustand';

import type { RecapData } from '../services/recap';

/**
 * 탐험 일지(별자리 리캡) 상태.
 * data != null = 편지함에 일지 도착(뱃지 표시), playing = 풀스크린 연출 재생 중.
 */
interface RecapState {
  data: RecapData | null;
  playing: boolean;
  setAvailable: (data: RecapData) => void;
  play: () => void;
  /** seen=true(보상 받기)면 열람 처리로 소진, false(나중에)면 편지함에 유지. */
  close: (seen: boolean) => void;
}

export const useRecapStore = create<RecapState>((set) => ({
  data: null,
  playing: false,
  setAvailable: (data) => set({ data }),
  play: () => set({ playing: true }),
  close: (seen) => set((s) => ({ playing: false, data: seen ? null : s.data })),
}));
