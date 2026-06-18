export const CONFIG = {
  H3_RESOLUTION: 10, // 헥사곤 지름 ≈ 130m. 변경 시 방문 데이터 전체 무효
  REVEAL_RADIUS_K: 1, // 현재 타일 + gridDisk(k) 만큼 밝힘 (k=1 → 약 3타일 반경)
  GPS_DISTANCE_INTERVAL_M: 15, // 15m 이동마다 위치 콜백
  GPS_TIME_INTERVAL_MS: 4000,
  GPS_ACCURACY_MAX_M: 50, // 정확도가 이보다 나쁜(값이 큰) fix는 무시 — GPS 튐 방지

  // 2단계 안개 (밝힌영역=선명 / 버퍼=옅은안개 / 그 외=어둠)
  FOG_NEAR_RADIUS_K: 3, // 밝힌 영역에서 이 타일 수까지는 옅은 안개(프론티어, ≈400m)
  FOG_NEAR_OPACITY: 0.6, // 옅은 안개(버퍼) — 지도 희미하게 보임
  FOG_FAR_OPACITY: 0.92, // 어두운 안개(미지) — 옅은 층과 겹쳐 거의 안 보임
} as const;
