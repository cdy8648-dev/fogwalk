# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# 배터리 헌장 — 핫패스 불변 규칙

위치 콜백 경로(핫패스)는 백그라운드에서 시간당 수천 번 실행될 수 있다.
대상 파일: `src/services/locationPipeline.ts`, `src/tasks/locationTask.ts`,
`src/tasks/geofenceTask.ts`, `src/services/progress.ts`(recordMovement).

1. **네트워크 금지** — Overpass/Wikidata/역지오코딩 등 일체. 꼭 필요하면
   `AppState.currentState === 'active'` 게이트 뒤에서만 (전례: locationPipeline).
2. **전체 로드 금지** — getDiscoveredLandmarks/getAllPhotos 같은 풀 테이블 읽기 불가.
   인덱스 있는 범위 쿼리나 단일 행만.
3. **기록은 얇게, 해석은 나중에** — 백그라운드는 원시 데이터(타일+타임스탬프)만 기록.
   통계·연출·판정 등 모든 "해석"은 앱을 열 때 1회 계산한다.
   (이 원칙을 지키면 기능을 무한히 추가해도 백그라운드 비용이 불변)
4. **JS 깨움 예산** — 백그라운드 전달은 배칭(BG_DEFER_INTERVAL_MS) 유지.
   새 깨움 소스(지오펜스류)를 추가하면 기존 소스와의 중복 방지(last_fix_at 패턴) 필수.

검증: 커밋 전 `npx tsc --noEmit`과 함께 `node scripts/check-hotpath.js` 실행.
(교훈: 2026-07 차량 1시간 주행에서 백그라운드 Overpass 폭풍으로 배터리 34% 소모 — Bump 1%)
