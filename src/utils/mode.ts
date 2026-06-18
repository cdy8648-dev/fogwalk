import { CONFIG } from '../constants/config';

export type TravelMode = 'walk' | 'cycle' | 'vehicle';

/** GPS 속도(m/s)로 이동수단 분류. 속도를 모르면 보수적으로 걷기로 본다. */
export function classifyMode(speedMps: number | null | undefined): TravelMode {
  if (speedMps == null || speedMps < 0) return 'walk';
  if (speedMps <= CONFIG.MODE_WALK_MAX_MPS) return 'walk';
  if (speedMps <= CONFIG.MODE_CYCLE_MAX_MPS) return 'cycle';
  return 'vehicle';
}

/** 이동수단별 XP/필름 가중치. (안개 reveal에는 적용하지 않음) */
export function modeWeight(speedMps: number | null | undefined): number {
  switch (classifyMode(speedMps)) {
    case 'walk':
      return CONFIG.MODE_WEIGHT_WALK;
    case 'cycle':
      return CONFIG.MODE_WEIGHT_CYCLE;
    case 'vehicle':
      return CONFIG.MODE_WEIGHT_VEHICLE;
  }
}
