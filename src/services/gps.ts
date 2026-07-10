import * as Location from 'expo-location';

import { CONFIG } from '../constants/config';
import { LOCATION_TASK } from '../tasks/locationTask';
import type { Coordinate } from '../types';

/**
 * expo-location 전담 모듈. 다른 파일은 expo-location을 직접 import하지 않고 이 서비스를 경유한다.
 * 백그라운드 추적은 tasks/locationTask.ts의 태스크가 처리한다.
 */

/** 포그라운드 위치 권한 요청. 허용 여부 반환. */
export async function requestPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

/** "항상 허용"(백그라운드) 권한 요청. 포그라운드 먼저 받은 뒤 백그라운드 요청. */
export async function requestBackgroundPermission(): Promise<boolean> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== 'granted') return false;
  const bg = await Location.requestBackgroundPermissionsAsync();
  return bg.status === 'granted';
}

/** 현재 위치 1회 조회 (고정밀). 첫 reveal·카메라 센터용. */
export async function getCurrentOnce(): Promise<Coordinate> {
  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return { lat: pos.coords.latitude, lng: pos.coords.longitude };
}

/** 현재 위치 1회 조회 (저정밀, 배터리 절약). 국가 판별처럼 대략 위치면 충분할 때. */
export async function getCurrentCoarse(): Promise<Coordinate> {
  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Low, // ≈1km — 국가/도시 판별에 충분, GPS 풀가동 회피
  });
  return { lat: pos.coords.latitude, lng: pos.coords.longitude };
}

/** 좌표 → 국가 + 권역(시/도) + 하위권역(시/구) (역지오코딩, 네이티브). 실패 시 null. */
export async function detectCountry(
  lat: number,
  lng: number
): Promise<{
  code: string;
  name: string;
  region: string | null;
  subregion: string | null;
} | null> {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lng,
    });
    const r = results[0];
    if (!r?.isoCountryCode) return null;
    return {
      code: r.isoCountryCode,
      name: r.country ?? r.isoCountryCode,
      region: r.region ?? null, // 시/도 (예: 서울특별시, 경기도)
      subregion: r.subregion ?? r.city ?? null, // 시/구 (예: 송파구, 수원시)
    };
  } catch {
    return null;
  }
}

/** 좌표 → 짧은 주소 문자열 (나만의 장소용). 실패 시 null. */
export async function reverseAddress(lat: number, lng: number): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    const r = results[0];
    if (!r) return null;
    // 시/도 · 시/구 · 도로명 순으로 있는 것만 조합 (해외 포맷도 무난하게)
    const parts = [r.region, r.subregion ?? r.city, r.street].filter(
      (s): s is string => !!s
    );
    // 중복 토큰 제거 (해외에서 region=city 같은 경우)
    const uniq = parts.filter((s, i) => parts.indexOf(s) === i);
    return uniq.length ? uniq.join(' ') : null;
  } catch {
    return null;
  }
}

/**
 * 백그라운드(+포그라운드) 추적 시작.
 * activityType=Fitness + pausesUpdatesAutomatically → iOS가 정지 감지 시 GPS를
 * 자동 일시정지하고 이동 재개 시 다시 켠다 = "걸을 때만 GPS" (배터리 절감).
 */
export async function startBackgroundTracking(): Promise<void> {
  const already = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
  if (already) return;
  await Location.startLocationUpdatesAsync(LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    activityType: Location.ActivityType.Fitness,
    pausesUpdatesAutomatically: true,
    distanceInterval: CONFIG.GPS_DISTANCE_INTERVAL_M,
    showsBackgroundLocationIndicator: true, // 파란 표시줄로 GPS on/off 시각 확인 가능
  });
}

/** 백그라운드 추적 중지. */
export async function stopBackgroundTracking(): Promise<void> {
  const already = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
  if (already) await Location.stopLocationUpdatesAsync(LOCATION_TASK);
}

// ── 브레드크럼 지오펜스 ─────────────────────────────────────────
// 일반 백그라운드 추적은 앱이 (강제)종료되면 끝. 지오펜스 이탈/진입은 종료된 앱도
// iOS가 다시 깨워줘서, 그 짧은 시간에 좌표 1점을 기록하고 펜스를 새 위치로 옮긴다.
// → 앱이 꺼져 있어도 FENCE_RADIUS_M 단위의 브레드크럼이 쌓이고, 경로 보간이 이어붙인다.

export const GEOFENCE_TASK = 'fogwalk-breadcrumb-fence';

/** 브레드크럼용 현재 위치 1회 — 깨어난 짧은 실행 시간 안에 잡히도록 Balanced. */
export async function getBreadcrumbFix(): Promise<{
  lat: number;
  lng: number;
  accuracy: number | null;
  speed: number | null;
}> {
  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    accuracy: pos.coords.accuracy ?? null,
    speed: pos.coords.speed ?? null,
  };
}

/** 브레드크럼 지오펜스를 (lat, lng) 중심으로 (재)설치 — 같은 태스크명 호출은 교체된다. */
export async function centerBreadcrumbFence(lat: number, lng: number): Promise<void> {
  await Location.startGeofencingAsync(GEOFENCE_TASK, [
    {
      identifier: 'breadcrumb',
      latitude: lat,
      longitude: lng,
      radius: CONFIG.FENCE_RADIUS_M,
      notifyOnEnter: true, // 이탈 처리 실패 시 재진입이 재시도 기회
      notifyOnExit: true,
    },
  ]);
}

/**
 * 포그라운드 전용 위치 구독 (백그라운드 권한 미허용 시 폴백).
 * distance/time 임계치마다 onMove 콜백.
 */
export async function startWatch(
  onMove: (lat: number, lng: number, speed: number | null) => void
): Promise<{ remove: () => void }> {
  const sub = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      distanceInterval: CONFIG.GPS_DISTANCE_INTERVAL_M,
      timeInterval: CONFIG.GPS_TIME_INTERVAL_MS,
    },
    (pos) => {
      const { latitude, longitude, accuracy, speed } = pos.coords;
      if (accuracy == null || accuracy > CONFIG.GPS_ACCURACY_MAX_M) return; // GPS 튐 무시
      onMove(latitude, longitude, speed ?? null);
    }
  );
  return { remove: () => sub.remove() };
}
