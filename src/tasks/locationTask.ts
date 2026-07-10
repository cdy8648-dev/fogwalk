import * as TaskManager from 'expo-task-manager';
import type { LocationObject } from 'expo-location';

import { processFixes } from '../services/locationPipeline';

/**
 * 백그라운드 위치 태스크.
 * iOS가 앱을 백그라운드로 깨워도 살아있도록 반드시 모듈 최상위에서 정의하고,
 * index.ts에서 import 하여 JS 로드 시 1회 등록한다.
 * 픽스 처리(reveal·경로 보간·진행도)는 공용 파이프라인(locationPipeline)이 담당.
 */
export const LOCATION_TASK = 'fogwalk-location-tracking';

TaskManager.defineTask<{ locations: LocationObject[] }>(
  LOCATION_TASK,
  async ({ data, error }) => {
    if (error) {
      console.warn('[locationTask]', error.message);
      return;
    }
    const locations = data?.locations;
    if (!locations || locations.length === 0) return;

    processFixes(
      locations.map((loc) => ({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        // 정확도 미상은 무시 대상(기존 동작 유지) — null=신뢰가 아니라 최악치로 취급
        accuracy: loc.coords.accuracy ?? Number.POSITIVE_INFINITY,
        speed: loc.coords.speed ?? null,
      }))
    );
  }
);
