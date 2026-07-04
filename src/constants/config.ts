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

  // 이동수단 속도 가중 (XP는 노력 기준; 안개 reveal은 무가중)
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

  // 줌아웃하면 마커가 단계별로 사라진다(클러터↓ 성능↑). 결국 전설 랜드마크만 남음.
  // 큰 값일수록 먼저(=덜 축소했을 때) 사라짐. 사라지는 순서: 지하철→일반→사진→희귀→(전설만)
  PHOTO_THUMB_MIN_ZOOM: 14, // 이 줌 이상=사진 썸네일/이모지 핀, 미만=점 (성능·가독성)
  SUBWAY_MIN_ZOOM: 13, // 미만이면 지하철 마커 숨김 (수가 많아 가장 먼저)
  LANDMARK_COMMON_MIN_ZOOM: 12, // 미만이면 일반(common) 랜드마크 숨김
  PHOTO_MIN_ZOOM: 11, // 미만이면 사진 마커 숨김 (전설 전단계에서 사라짐)
  LANDMARK_RARE_MIN_ZOOM: 9, // 미만이면 희귀(rare) 숨김
  LANDMARK_EPIC_MIN_ZOOM: 7, // 미만이면 영웅(epic)도 숨김 → 전설만 남음
  PHOTO_GROUP_RES: 11, // 사진 묶음용 H3 해상도 (≈같은 자리, ~50m)

  // 랜드마크 (발견요소 4단계 마스터 시트 기준)
  LANDMARK_FETCH_RADIUS_M: 1000, // 새 지역 진입 시 OSM 조회 반경 (작게 — Overpass 타임아웃 방지)
  LANDMARK_FETCH_CELL_RES: 8, // 조회 중복 방지용 H3 해상도(≈0.9km 셀, 반경 1km가 충분히 덮음)
  LANDMARK_DISCOVER_RADIUS_M: 150, // 이 반경 안에 들어오면 발견
  // 공항은 OSM 폴리곤 중심이 활주로 한가운데(터미널에서 ~2km) → 넓은 전용 반경
  LANDMARK_DISCOVER_RADIUS_AIRPORT_M: 2500,
  LANDMARK_BURST_RADIUS_K: 4, // 발견 시 안개 뻥: 중심 gridDisk(k) reveal (≈500m)
  XP_LANDMARK_COMMON: 80,
  XP_LANDMARK_RARE: 250,
  XP_LANDMARK_EPIC: 500,
  XP_LANDMARK_LEGENDARY: 1000,
  XP_SUBWAY: 0, // 지하철은 XP 없음 — 도감 채우기 트랙 (마스터 시트)
  PEAK_MIN_ELE_M: 500, // wikidata 없는 봉우리는 이 고도(m) 이상만 인정

  // 잉크(소비형 통화): 걸어서 번다(모드 가중 → 운전은 적게). 지도 라벨/공개에 사용.
  INK_PER_KM: 1, // 가중 1km당 잉크 (튜닝 가능)

  // 잉크 안개 지우기 (연필 핀에서). 회색만 가능 — 검은 안개는 회색을 밝혀 전선을 미는 방식
  INK_COST_GRAY: 1, // 회색(근접) 안개 1칸
  INK_BULK_MAX_TILES: 30, // 일괄 밝히기 상한(칸). 회색 프론티어는 거대할 수 있어 가까운 순으로 자름
} as const;
