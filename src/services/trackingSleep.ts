import { AppState } from 'react-native';

import { CONFIG } from '../constants/config';
import { haversineMeters } from '../utils/distance';
import { getSetting, setSetting } from './db';
import { resumeTracking, stopBackgroundTracking } from './gps';

/**
 * 정지 슬립 — 백그라운드에서 한 자리에 머물면 GPS를 완전히 끈다.
 * 실내 GPS 지터(15m+)가 밤새 픽스를 만들어 수면 중 배터리를 먹던 문제의 해법.
 * 재개는 브레드크럼 지오펜스(250m 이탈)와 앱 포그라운드 복귀가 담당.
 * 핫패스에서 호출되므로 O(1): 앵커 비교 1회, DB 쓰기는 슬립 전환 순간 1회뿐.
 */

const SLEEP_KEY = 'tracking_sleeping';

let anchor: { lat: number; lng: number; since: number } | null = null;

/** 픽스마다 호출(파이프라인 배치당 1회) — 정지 지속 시 슬립 진입. */
export function noteFixForSleep(lat: number, lng: number): void {
  const now = Date.now();
  if (!anchor || haversineMeters(anchor, { lat, lng }) > CONFIG.STATIONARY_RADIUS_M) {
    anchor = { lat, lng, since: now }; // 움직임 — 앵커 갱신
    return;
  }
  // 포그라운드는 슬립 금지(지도 내 위치 점 실시간 필요)
  if (AppState.currentState === 'active') return;
  if (now - anchor.since < CONFIG.SLEEP_AFTER_MS) return;

  setSetting(SLEEP_KEY, '1');
  anchor = null; // 재개 후 새 앵커부터
  void stopBackgroundTracking().catch(() => {});
}

/** 슬립 중이면 추적 재개 — 지오펜스 깨움(background)·앱 활성화(foreground)에서 호출. */
export async function wakeIfSleeping(foreground: boolean): Promise<void> {
  if (getSetting(SLEEP_KEY) !== '1') return;
  setSetting(SLEEP_KEY, '0');
  try {
    await resumeTracking(foreground);
  } catch {
    // 권한 회수 등 — 다음 앱 실행의 useTracking 부트스트랩이 정리
  }
}
