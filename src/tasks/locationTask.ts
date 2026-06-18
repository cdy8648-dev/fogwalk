import * as TaskManager from 'expo-task-manager';
import type { LocationObject } from 'expo-location';

import { CONFIG } from '../constants/config';
import { insertVisitedTiles } from '../services/db';
import { recordMovement, refreshProgressStore } from '../services/progress';
import { useMapStore } from '../store/mapStore';
import { revealTilesFor } from '../utils/h3';

/**
 * 백그라운드 위치 태스크.
 * iOS가 앱을 백그라운드로 깨워도 살아있도록 반드시 모듈 최상위에서 정의하고,
 * index.ts에서 import 하여 JS 로드 시 1회 등록한다.
 * 위치 처리는 포그라운드/백그라운드 공통으로 여기서 수행한다.
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

    const fresh: string[] = [];
    let lastAccepted: { lat: number; lng: number } | null = null;
    for (const loc of locations) {
      const { latitude, longitude, accuracy, speed } = loc.coords;
      // 정확도 나쁜(또는 알 수 없는) fix는 무시 — GPS 튐 방지
      if (accuracy == null || accuracy > CONFIG.GPS_ACCURACY_MAX_M) continue;
      lastAccepted = { lat: latitude, lng: longitude };
      const newTiles = insertVisitedTiles(revealTilesFor(latitude, longitude));
      recordMovement(latitude, longitude, speed ?? null, newTiles.length); // 거리·스트릭·가중
      if (newTiles.length) fresh.push(...newTiles);
    }

    // DB 기록은 위에서 끝. 스토어 갱신은 포그라운드일 때만 화면에 반영된다(백그라운드면 무해).
    const store = useMapStore.getState();
    if (lastAccepted) store.setLocation(lastAccepted);
    if (fresh.length) store.addVisitedTiles(fresh);
    refreshProgressStore(true);
  }
);
