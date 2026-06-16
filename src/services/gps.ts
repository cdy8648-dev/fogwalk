import * as Location from 'expo-location';

import { CONFIG } from '../constants/config';
import type { Coordinate } from '../types';

/**
 * expo-location 전담 모듈 (포그라운드 전용).
 * Phase 2에서 이 파일에 백그라운드 태스크를 추가한다.
 * 다른 파일은 expo-location을 직접 import하지 않고 전부 이 서비스를 경유한다.
 */

/** 포그라운드 위치 권한 요청. 허용 여부 반환. */
export async function requestPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

/** 현재 위치 1회 조회 (고정밀). */
export async function getCurrentOnce(): Promise<Coordinate> {
  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return { lat: pos.coords.latitude, lng: pos.coords.longitude };
}

/** 위치 변화 구독. distance/time 임계치마다 onMove 콜백. */
export async function startWatch(
  onMove: (c: Coordinate) => void
): Promise<{ remove: () => void }> {
  const sub = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      distanceInterval: CONFIG.GPS_DISTANCE_INTERVAL_M,
      timeInterval: CONFIG.GPS_TIME_INTERVAL_MS,
    },
    (pos) => onMove({ lat: pos.coords.latitude, lng: pos.coords.longitude })
  );
  return { remove: () => sub.remove() };
}
