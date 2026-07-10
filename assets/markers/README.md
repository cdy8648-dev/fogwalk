# FogWalk — 발견 카테고리 아이콘 세트 (3D 클레이 코인)

## Overview
FogWalk(iOS 탐험 앱)의 발견 카테고리 아이콘 25종. 기존 뱃지 아이콘과 같은 3D 클레이/글로시 렌더 계열 — 딥네이비 face + 아이보리 글리프 + 상단 gloss. **이 SVG들은 프로덕션 에셋이다 — 그대로 앱 번들에 넣어 사용한다** (재구현 대상 아님).

## Folder Structure
```
icons/
  detail-*.svg      # 세부 카테고리 코인 20종 (200×200, 투명 배경)
  filter-*.svg      # 상위 필터 코인 5종
  glyph/            # 동일 25종의 글리프-온리 버전 (코인·그림자·광택 없음)
  manifest.json     # [{id, name, group}] 카탈로그
```

## Icon Catalog

### 상위 필터 (5)
- `filter-all` 전체(반짝임 별) · `filter-culture` 건축·문화 · `filter-nature` 자연(잎) · `filter-transport` 교통(경로+핀) · `filter-etc` 기타(점 3개)

### 세부 — 건축·문화 (9, 골드 포인트 #E0A458)
`detail-palace` 궁궐 · `detail-temple` 사찰 · `detail-tower` 타워 · `detail-ruins` 유적(성문+깃발) · `detail-monument` 기념물(비석) · `detail-museum` 박물관 · `detail-bridge` 다리 · `detail-landmark` 명소(별) · `detail-market` 시장

### 세부 — 자연 (5, 라임 포인트 #C8F560)
`detail-park` 공원 · `detail-mountain` 산 · `detail-lake` 호수 · `detail-beach` 해변 · `detail-forest` 숲

### 세부 — 교통 (5, 틸 포인트 #5BC0BE)
`detail-metro` 지하철 · `detail-station` 기차역 · `detail-airport` 공항 · `detail-harbor` 항구 · `detail-cablecar` 케이블카

### 세부 — 기타 (1, 바이올렛 포인트 #8B7CFF)
`detail-pin` 기타(핀)

## Usage Rules
1. **코인 버전** (`icons/*.svg`): 발견 카드, 필터 칩, 상세 화면 등 아이콘이 크게 보이는 곳.
   - 캔버스 200×200, 코인 실경계 약 지름 180px (드롭섀도 여백 포함).
   - 등급 중립 — 등급색(전설 골드/영웅 바이올렛/희귀 틸) 링은 앱에서 코인 바깥에 테두리로 입힌다.
2. **글리프 버전** (`icons/glyph/*.svg`): 지도 마커 축소 상태, 리스트 셀 등 작은 크기.
   - 심볼만 투명 배경. 권장 사용: 딥네이비(#1D2748) 배경원 + 등급색 2px 링 위에 글리프 배치 (원 지름의 ~70% 크기).
   - 글리프 색은 아이보리 #F4EFE6 고정 + 카테고리 포인트 색 일부 포함. 라이트 배경 위에 단독 사용 금지(대비 부족) — 반드시 네이비 배경원과 함께.
3. SVG를 그대로 렌더 (iOS: SVG 지원 라이브러리 또는 빌드 시 PNG @1x/@2x/@3x 래스터라이즈).
4. `manifest.json`의 `id`를 카테고리 enum 키와 매핑해 사용.

## Design Tokens (참고)
- 코인 face: radial #2E3B66→#1D2748→#10162C / rim #3A4977→#0C1122
- 글리프: 아이보리 #F4EFE6, 음영 #080D1E (아래 3.5px 압출)
- 포인트: 골드 #E0A458 · 라임 #C8F560 · 틸 #5BC0BE · 바이올렛 #8B7CFF

## Preview
`FogWalk 발견 아이콘.dc.html` — 전체 갤러리 + 투명 배경 확인 + 축소 마커 시뮬레이션. 디자인 레퍼런스용이며 구현 대상 아님.
