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

  // 이동수단 속도 가중 (XP/필름은 노력 기준; 안개 reveal은 무가중)
  MODE_WALK_MAX_MPS: 2.5, // 이하 = 걷기/달리기 (≈9km/h)
  MODE_CYCLE_MAX_MPS: 7, // 이하 = 자전거 (≈25km/h), 초과 = 차량
  MODE_WEIGHT_WALK: 1.0,
  MODE_WEIGHT_CYCLE: 0.5,
  MODE_WEIGHT_VEHICLE: 0.1,
  MAX_SEGMENT_M: 1000, // 두 위치 간 거리가 이보다 크면 끊김으로 보고 거리 누적 제외

  // XP (모두 노력 가중된 거리·타일 기준)
  XP_PER_KM: 50,
  XP_PER_TILE: 10,
  XP_STREAK_BONUS_PER_DAY: 0.02, // 스트릭 1일당 +2%
  XP_STREAK_BONUS_MAX: 0.3, // 최대 +30%

  // 필름 (사진 게시용 소모재) — 노력 가중 거리 기준
  FILM_PER_KM: 1, // 가중 1km당 필름 1장

  // 이 줌 이상에서만 사진 썸네일, 그보다 축소하면 점으로 (성능·가독성)
  PHOTO_THUMB_MIN_ZOOM: 14,
  SUBWAY_MIN_ZOOM: 13, // 이 줌 미만이면 지하철 마커 숨김 (수가 많아 클러터 방지)
  PHOTO_GROUP_RES: 11, // 사진 묶음용 H3 해상도 (≈같은 자리, ~50m)

  // 랜드마크 (Phase 3)
  LANDMARK_FETCH_RADIUS_M: 1000, // 새 지역 진입 시 OSM 조회 반경 (작게 — Overpass 타임아웃 방지)
  LANDMARK_FETCH_CELL_RES: 8, // 조회 중복 방지용 H3 해상도(≈0.9km 셀, 반경 1km가 충분히 덮음)
  LANDMARK_DISCOVER_RADIUS_M: 150, // 이 반경 안에 들어오면 발견
  LANDMARK_BURST_RADIUS_K: 4, // 발견 시 안개 뻥: 중심 gridDisk(k) reveal (≈500m)
  XP_LANDMARK_COMMON: 80,
  XP_LANDMARK_RARE: 250,
  XP_LANDMARK_LEGENDARY: 800,
  XP_SUBWAY: 40, // 지하철역 발견 (수가 많으니 낮게)
  PEAK_MIN_ELE_M: 500, // wikidata 없는 봉우리는 이 고도(m) 이상만 인정
} as const;
