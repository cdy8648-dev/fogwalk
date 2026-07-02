import { create } from 'zustand';

/**
 * 지도 화면의 액션을 탭바(카메라 버튼) 등 외부에서 호출하기 위한 브리지.
 * MapScreen이 실제 구현(capture)을 등록하고, CustomTabBar가 호출한다.
 */
interface MapUiState {
  capture: () => void; // 사진 촬영 (MapScreen이 등록)
  capturing: boolean; // 촬영 진행 중
  setCapture: (fn: () => void) => void;
  setCapturing: (v: boolean) => void;
}

export const useMapUiStore = create<MapUiState>((set) => ({
  capture: () => {},
  capturing: false,
  setCapture: (fn) => set({ capture: fn }),
  setCapturing: (v) => set({ capturing: v }),
}));
