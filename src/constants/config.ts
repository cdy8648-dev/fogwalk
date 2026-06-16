export const CONFIG = {
  H3_RESOLUTION: 10, // 헥사곤 지름 ≈ 130m. 변경 시 방문 데이터 전체 무효
  REVEAL_RADIUS_K: 1, // 현재 타일 + gridDisk(k) 만큼 밝힘 (k=1 → 약 3타일 반경)
  GPS_DISTANCE_INTERVAL_M: 15, // 15m 이동마다 위치 콜백
  GPS_TIME_INTERVAL_MS: 4000,
} as const;
