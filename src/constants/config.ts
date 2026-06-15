export const CONFIG = {
  H3_RESOLUTION: 9, // 헥사곤 1개 ≈ 174m². 변경 시 DB 전체 초기화 필요
  REVEAL_RADIUS_M: 100,
  GPS_INTERVAL_MS: 5000,
  MIN_MOVE_M: 10,
  SESSION_PAUSE_MS: 60000,
} as const;
