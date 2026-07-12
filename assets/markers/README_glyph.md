# FogWalk — 지도 마커 에셋 (맵 글리프 v2 + 줌아웃 별)

## Overview
지도(map) 페이지 발견 마커용 프로덕션 에셋. **배경원·링 없이 아이보리 지도 위에 SVG를 직접 올린다.** 딥네이비(#1D2748) 베이스 + 포인트색 악센트라 라이트 지도에서 자체 대비 확보. 한국 모티프(기와지붕·석탑·성문·N타워 등). **재구현 금지 — SVG 그대로 사용.**

## Folder Structure
```
glyph/
  detail-*.svg              # 일반(common) 등급 마커 20종 — 카테고리 포인트색
  star-dot.svg              # 줌아웃 별 · 먼 줌 (흰색, 일반 등급용)
  star-glow.svg             # 줌아웃 별 · 가까운 줌 (흰색 + 발광 링)
  tiers/
    legendary/              # 전설 (골드 #E0A458) — detail 20종 + star 2종
    heroic/                 # 영웅 (바이올렛 #8B7CFF) — 〃
    rare/                   # 희귀 (틸 #5BC0BE) — 〃
```
모든 파일 200×200 viewBox, 투명 배경.

## 마커 선택 로직
```
markerSVG(discovery) =
  zoomedOut?  glyph/[tierDir]/star-(dot|glow).svg   // 줌 레벨에 따라 dot/glow
  else        glyph/[tierDir]/detail-<category>.svg
tierDir = { legendary:"tiers/legendary/", heroic:"tiers/heroic/", rare:"tiers/rare/", common:"" }
```
- **등급 표현은 SVG에 내장** (등급색 악센트 + radial 글로우). 앱에서 틴트·글로우·링 코드 불필요.
- 일반(common) 등급 = `glyph/` 루트의 중립 버전.

## 렌더 크기
- 세부 글리프: **44px** (검증된 크기 — 이 크기에서 20종 상호 구분 확인 완료). 최소 36px 권장.
- star-dot: 약 **8px** (먼 줌) / star-glow: 약 **14px** (가까운 줌).
- 탭 히트 영역은 시각 크기와 무관하게 44×44pt 이상 확보.

## 카테고리 매핑 (detail-* 20종)
- 건축·문화(골드): palace 궁궐 · temple 사찰(석탑) · tower 타워(N타워) · ruins 유적(성문) · monument 기념물(비석) · museum 박물관 · bridge 다리 · landmark 명소(별) · market 시장
- 자연(라임): park 공원 · mountain 산 · lake 호수 · beach 해변 · forest 숲
- 교통(틸): metro 지하철(전면) · station 기차역(KTX 측면) · airport 공항 · harbor 항구 · cablecar 케이블카
- 기타(바이올렛): pin 핀

## 주의
- 다크 배경 위 사용 금지 (네이비 글리프라 대비 부족) — 다크 UI에는 별도 코인 세트(발견 카드용)가 있음.
- SVG 파일명·폴더 구조를 그대로 유지해 카테고리 enum과 매핑할 것.
