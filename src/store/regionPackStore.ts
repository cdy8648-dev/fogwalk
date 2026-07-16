import { create } from 'zustand';

/**
 * 해외 지역팩 다운로드 UI 상태.
 * - ready: 로컬에 준비된(번들/캐시/방금 받은) 국가코드 집합.
 * - pending: 대국이라 자동 다운로드 보류 중 — 지도/여권에 "받기" 칩을 띄운다(로밍 방어).
 * - downloading: 진행 중 국가코드.
 * 실제 다운로드/캐시/등록은 services/regionPackDownload.ts.
 */
interface PendingPack {
  cc: string;
  name: string; // 국가 표시명 (예: '미국')
  bytes: number; // 원본 JSON 크기
}

interface RegionPackState {
  ready: Set<string>;
  pending: PendingPack | null;
  downloading: string | null;
  markReady: (cc: string) => void;
  setPending: (p: PendingPack | null) => void;
  setDownloading: (cc: string | null) => void;
}

export const useRegionPackStore = create<RegionPackState>((set) => ({
  ready: new Set(['KR']), // KR은 번들
  pending: null,
  downloading: null,
  markReady: (cc) =>
    set((s) => {
      const ready = new Set(s.ready);
      ready.add(cc.toUpperCase());
      // 준비되면 같은 국가의 보류 칩은 해제
      const pending = s.pending?.cc === cc.toUpperCase() ? null : s.pending;
      return { ready, pending, downloading: s.downloading === cc.toUpperCase() ? null : s.downloading };
    }),
  setPending: (pending) => set({ pending }),
  setDownloading: (downloading) => set({ downloading }),
}));
