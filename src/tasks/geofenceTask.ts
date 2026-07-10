import * as TaskManager from 'expo-task-manager';

import { CONFIG } from '../constants/config';
import { centerBreadcrumbFence, getBreadcrumbFix, GEOFENCE_TASK } from '../services/gps';
import { processFixes } from '../services/locationPipeline';

/**
 * 브레드크럼 지오펜스 태스크.
 * 펜스 이탈/진입 시 — 앱이 종료돼 있어도 — iOS가 앱을 깨워 이 핸들러를 실행한다.
 * 좌표 1점 기록(+직전 지점과 경로 보간) 후 펜스를 현재 위치로 옮겨 다시 잠든다.
 * locationTask처럼 모듈 최상위에서 정의하고 index.ts에서 import해 JS 로드 시 등록.
 */
TaskManager.defineTask(GEOFENCE_TASK, async ({ error }) => {
  if (error) {
    console.warn('[geofenceTask]', error.message);
    return;
  }
  try {
    const fix = await getBreadcrumbFix();
    processFixes([fix], CONFIG.FENCE_ACCURACY_MAX_M);
    await centerBreadcrumbFence(fix.lat, fix.lng);
  } catch {
    // 위치 실패 — 기존 펜스 유지. 재진입/재이탈 이벤트가 다음 재시도 기회.
  }
});
