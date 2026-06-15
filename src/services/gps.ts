import * as Location from 'expo-location';

import type { Coordinate } from '../types';

/**
 * expo-location 전담 모듈.
 * Phase 0 에서는 권한 요청 + 단발성 위치 조회만 제공한다.
 * Phase 2 에서 expo-task-manager 기반 백그라운드 위치 추적 태스크를 여기에 추가한다.
 */

/** 포그라운드 위치 권한 요청. 허용 여부를 반환. */
export async function requestForegroundPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

/** 백그라운드 위치 권한 요청(Phase 2 추적용). 허용 여부를 반환. */
export async function requestBackgroundPermission(): Promise<boolean> {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  return status === 'granted';
}

/** 현재 위치 1회 조회. 권한이 없으면 null. */
export async function getCurrentLocation(): Promise<Coordinate | null> {
  const granted = await requestForegroundPermission();
  if (!granted) return null;

  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return { lat: pos.coords.latitude, lng: pos.coords.longitude };
}
