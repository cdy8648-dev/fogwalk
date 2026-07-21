import { AppState } from 'react-native';

import type { WeatherCondition } from '../constants/weather';
import { useWeatherStore } from '../store/weatherStore';
import { getCurrentCoarse } from './gps';

/**
 * 현재 위치 날씨 — Open-Meteo(무료·API 키 불필요). 상태 카드 칩용.
 * 배터리 헌장: 네트워크는 포그라운드(AppState active)에서만, 핫패스에서 호출 금지.
 * 프라이버시: 좌표를 소수 1자리(~11km, 도시 수준)로 반올림해 조회 + 캐시 키.
 * TTL 30분 + 같은 도시면 재호출 안 함.
 */

const TTL_MS = 30 * 60_000;
let lastFetch = 0;
let lastKey = '';

// Open-Meteo WMO weathercode → 우리 조건값 (assets/README_weather.md 매핑)
function wmoToCondition(code: number): WeatherCondition {
  if (code <= 1) return 'clear'; // 0 맑음, 1 대체로 맑음
  if (code === 2) return 'partly'; // 부분 구름
  if (code === 3) return 'overcast'; // 흐림
  if (code === 45 || code === 48) return 'fog'; // 안개
  if (code >= 95) return 'thunder'; // 95/96/99 뇌우
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'; // 눈
  return 'rain'; // 51-67 이슬비/비, 80-82 소나기
}

/** 포그라운드에서 현재 위치 날씨 1회 갱신. fire-and-forget로 호출. */
export async function refreshWeather(): Promise<void> {
  if (AppState.currentState !== 'active') return; // 배터리 헌장 — 포그라운드에서만
  try {
    const c = await getCurrentCoarse(); // 저정밀로 충분(도시 수준)
    const lat = Math.round(c.lat * 10) / 10; // 소수 1자리 반올림(프라이버시·캐시)
    const lng = Math.round(c.lng * 10) / 10;
    const key = `${lat},${lng}`;
    const now = Date.now();
    if (key === lastKey && now - lastFetch < TTL_MS) return; // 같은 도시 + TTL 이내 → skip

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&current_weather=true`;
    const res = await fetch(url);
    if (!res.ok) return;
    const json = (await res.json()) as {
      current_weather?: { temperature: number; weathercode: number; is_day: number };
    };
    const cw = json.current_weather;
    if (!cw) return;

    lastFetch = now;
    lastKey = key;
    useWeatherStore.getState().set({
      condition: wmoToCondition(cw.weathercode),
      night: cw.is_day === 0,
      temp: Math.round(cw.temperature),
    });
  } catch {
    /* 오프라인·위치 실패 등 — 조용히 무시(칩 미표시 유지) */
  }
}
