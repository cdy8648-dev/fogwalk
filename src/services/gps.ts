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

/** 현재 위치 1회 조회 (고정밀). */
export async function getCurrentOnce(): Promise<Coordinate> {
  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return { lat: pos.coords.latitude, lng: pos.coords.longitude };
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
