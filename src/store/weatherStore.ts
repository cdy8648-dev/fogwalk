import { create } from 'zustand';

import type { WeatherData } from '../constants/weather';

/**
 * 현재 위치 날씨 (상태 카드 칩용). 데이터 없으면 null → 칩 미렌더.
 * 갱신은 services/weather.ts refreshWeather (포그라운드·TTL 캐시).
 */
interface WeatherState {
  data: WeatherData | null;
  set: (data: WeatherData) => void;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  data: null,
  set: (data) => set({ data }),
}));
