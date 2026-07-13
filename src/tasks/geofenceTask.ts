import * as TaskManager from 'expo-task-manager';

import { CONFIG } from '../constants/config';
import { getSetting } from '../services/db';
import { centerBreadcrumbFence, getBreadcrumbFix, GEOFENCE_TASK } from '../services/gps';
import { processFixes } from '../services/locationPipeline';
import { wakeIfSleeping } from '../services/trackingSleep';

// 본추적(locationTask)이 최근에 픽스를 처리했으면 브레드크럼은 중복 — GPS 원샷 낭비 방지.
// 차량 주행 시 250m마다(시간당 240회) 추가 GPS 조회를 하던 것이 배터리 가중 요인이었다.
const TRACKING_ALIVE_MS = 3 * 60_000;

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
    // 정지 슬립으로 GPS를 꺼뒀다면 — 움직이기 시작했다는 신호이니 본추적 재개
    await wakeIfSleeping(false);

    // 본추적이 살아있으면(최근 픽스 있음) 스킵 — 종료/중단된 경우에만 브레드크럼 가동
    const lastFixAt = Number(getSetting('last_fix_at') ?? 0);
    if (Date.now() - lastFixAt < TRACKING_ALIVE_MS) return;

    const fix = await getBreadcrumbFix();
    processFixes([fix], CONFIG.FENCE_ACCURACY_MAX_M);
    await centerBreadcrumbFence(fix.lat, fix.lng);
  } catch {
    // 위치 실패 — 기존 펜스 유지. 재진입/재이탈 이벤트가 다음 재시도 기회.
  }
});
