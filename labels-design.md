# FogWalk — 잉크 + 커스텀 지도 라벨 설계 (Phase 6A)

> "걸어서 모은 잉크로 내 지도를 꾸민다." 필름을 대체하는 새 소비통화 + 사용자 라벨.
> 결정: 잉크 **빡빡하게** / 라벨은 **밝힌 땅만** / **이모지+텍스트** / 롱프레스+줌게이트 / 튜토리얼은 나중.

## 1. 데이터
- 신규 테이블 `map_labels(id TEXT PK, lat REAL, lng REAL, emoji TEXT, text TEXT, created_at INTEGER)`
  - (색·아이콘은 2차) — `color`, `icon` 컬럼은 나중에 추가
- `progress` 테이블에 `ink REAL DEFAULT 0` (필름 자리 재활용), `userStore`에 `ink` 추가
- 새 스토어 `labelStore`(hydrate/add/update/remove) — photoStore 패턴 그대로

## 2. 잉크 경제 (config.ts, 튜닝값)
- **적립**: 걸은 만큼 — `ink += 가중거리km × INK_PER_KM`. (필름 적립 로직 재활용)
  - 제안: `INK_PER_KM = 1`
- **소비**: 라벨 1개 = `INK_PER_LABEL`. **빡빡하게** → 제안 `INK_PER_LABEL = 5` (≈5km당 라벨 1개)
  - 편집 무료 / 삭제 무료(환불 X)
- **표시**: 맵 우하단(예전 필름 배지 자리)에 🖋️ 잉크 잔액 칩
- XP/레벨은 그대로 영구 진행도. 잉크가 유일한 소비 루프

## 3. 생성 플로우 (롱프레스 + 줌게이트 + 밝힌 땅 제약)
1. 지도 **롱프레스** → rnmapbox `onLongPress(feature)` → 좌표 획득
2. **줌 체크**: 현재 줌 < `LABEL_MIN_ZOOM`(예 15)이면 → "지도를 확대해주세요" + **[확대하기]** 버튼 → `camera.setCamera({centerCoordinate: 좌표, zoomLevel: 16})` 애니메이션 후 재시도 안내
3. **밝힌 땅 체크**: 좌표의 H3 타일이 `visitedTileIds`에 없으면 → "탐험한 곳에만 라벨을 남길 수 있어요" 토스트, 중단
4. **잉크 체크**: 잔액 < `INK_PER_LABEL`이면 → "잉크가 부족해요. 더 걸어서 모아보세요" 안내
5. **라벨 시트**: 이모지 선택(고정 팔레트 그리드) + 텍스트 입력(짧게, 예 20자) → [남기기]
6. 확정 → 잉크 차감 + `map_labels` insert + 스토어 add → 마커 등장

## 4. 편집 / 삭제
- 라벨 탭 → 시트(보기/편집/삭제). 편집·삭제 무료. (사진 뷰어의 저장/삭제 패턴 참고)

## 5. 렌더
- **MVP: MarkerView** — 이모지 + (있으면)텍스트 핀(작은 pill). 줌아웃 시 숨김/점 처리(지하철처럼 `LABEL_MIN_ZOOM` 활용)
- 라벨 많아지면 **텍스트는 Mapbox SymbolLayer**(GPU + 자동 충돌정리)로 이관 — 2차

## 6. 제약·결정 (확정됨)
- 라벨은 **밝힌 땅(안개 걷힌 곳)에만** — 탐험 테마 유지
- 콘텐츠 = **이모지 + 짧은 텍스트** (색/아이콘 피커는 2차)
- 잉크 **빡빡** (5km/라벨 기준선, config로 조정)
- 첫 사용 **튜토리얼 팝업은 나중에** 신규 설치자 대상으로 한 번에

## 7. 단계
- **1차(MVP)**: 롱프레스 생성(줌게이트+밝힌땅+잉크) · 이모지+텍스트 · 마커 표시 · 편집/삭제 · 잉크 적립/소비/표시
- **2차**: 아이콘 피커 · 색 · 드래그 이동 · SymbolLayer · 라벨도 도감(Collection)에 섹션

## 8. 파일 변경(예상)
- `types`(MapLabel), `services/db.ts`(map_labels CRUD + progress.ink), `store/labelStore.ts`, `services/progress.ts`(잉크 적립), `constants/config.ts`(INK_*·LABEL_MIN_ZOOM), `components/map/LabelMarkers.tsx`, 라벨 생성/편집 시트, `MapScreen`(onLongPress+잉크칩), 마이그레이션(progress.ink 추가 — 기존 행 0)

## 8b. 잉크 사용처 2 — "갭 리빌"(땅따먹기 가운데 밝히기) — *기획 더 필요*
사용자 아이디어(검토 완료, 채택 후보). 라벨과 함께 잉크의 두 번째 소비처.
- **메커닉**: 안개 타일 롱프레스 → 그 지점에서 **연결된 안개 영역 flood-fill**(밝힌 타일이 경계, BFS) → 그 칸들을 잉크로 reveal
- **상한(cap)**: fill이 N(예 300타일) 넘으면 "너무 넓어요"로 거절 → 넓은 열린 안개 차단 + flood-fill 폭주 방지(성능 안전)
- **비용 초선형**: `cost = ceil(BASE × tiles^1.6)` 류 → 작은 갭은 싸고, 넓은 영역은 기하급수 → 잉크로 전체 밝히기는 사실상 불가(의도대로)
- **롱프레스 공존**: 밝힌 땅 위=라벨 / 안개 위=갭 리빌 (누른 위치 문맥 분기, 같은 제스처)
- **성능**: flood-fill Set멤버십 O(1)+cap → 즉시. reveal은 기존 insertVisitedTiles+FogLayer 경로
- **결정거리**: cap 크기, BASE·지수, ink-reveal 칸을 면적/마일스톤/권역에 카운트할지(권장 카운트)

## 9. 열린 항목
- 잉크 적립을 걷기만? 발견/레벨업 보너스도? (MVP는 걷기만 권장)
- 이모지 팔레트 구성(몇 개·어떤 것)
- 라벨 마커가 발견/사진/지하철과 겹칠 때 우선순위/컬링(Phase 5와 연계)
