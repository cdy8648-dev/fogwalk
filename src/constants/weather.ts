/**
 * 날씨 조건 → 아이콘 키 매핑 (assets/README_weather.md 기준).
 * 야간 변형(wx-night*)은 clear/overcast에만 존재 — 나머지는 주간 아이콘 공용.
 * 실제 날씨 데이터 소스(예 Open-Meteo WMO 코드)는 이 조건값으로 정규화해 넘긴다.
 */
export type WeatherCondition =
  | 'clear'
  | 'partly'
  | 'overcast'
  | 'rain'
  | 'snow'
  | 'thunder'
  | 'fog';

/** 상태 카드 날씨 칩용 정규화 데이터 (소스 무관). */
export interface WeatherData {
  condition: WeatherCondition;
  night?: boolean;
  temp: number; // °C (정수)
}

export function weatherIconKey(condition: WeatherCondition, night = false): string {
  switch (condition) {
    case 'clear':
      return night ? 'wx-night' : 'wx-sunny';
    case 'partly':
      return 'wx-partly';
    case 'overcast':
      return night ? 'wx-night-cloudy' : 'wx-cloudy';
    case 'rain':
      return 'wx-rain';
    case 'snow':
      return 'wx-snow';
    case 'thunder':
      return 'wx-thunder';
    case 'fog':
      return 'wx-fog';
  }
}
