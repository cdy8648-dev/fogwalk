# FogWalk — 날씨 아이콘 세트 (글래스 칩용)

## Overview
상태 카드의 날씨 표시용 벡터 아이콘 9종. 다크 글래스 칩(`rgba(13,15,26,.82)` + 블러) 위에서 빛나 보이도록 팔레트 컬러 + 반투명 프로스트 하이라이트. **프로덕션 에셋 — SVG 그대로 사용.**

## 기술 규격
- viewBox 0 0 200 200, 투명 배경
- fill + stroke(둥근 라인) 사용, 알파는 `opacity` 속성 (rgba stop-color 없음) — react-native-svg 호환
- 그라디언트·필터 없음
- 권장 렌더: 칩 안 16~18px, 단독 26~34px

## 파일 목록 (weather/wx-*.svg)
- `wx-sunny` 맑음 (앰버 #FFB830 해 + 광선)
- `wx-partly` 구름조금 (해 + 구름)
- `wx-cloudy` 흐림 (겹구름, 틸 뒷구름)
- `wx-rain` 비 (구름 + 틸 #5BC0BE 빗줄기)
- `wx-snow` 눈 (구름 + 눈송이 점)
- `wx-thunder` 뇌우 (구름 + 앰버 번개)
- `wx-fog` 안개 (구름 + 가로 안개선)
- `wx-night` 맑은 밤 (바이올렛 #8B7CFF 초승달 + 라임 별)
- `wx-night-cloudy` 흐린 밤 (달 + 구름)

## 날씨 코드 매핑 (참고)
맑음/clear→wx-sunny · 구름조금/partly→wx-partly · 흐림/overcast→wx-cloudy · 비/rain·drizzle·shower→wx-rain · 눈/snow→wx-snow · 뇌우/thunderstorm→wx-thunder · 안개/fog·mist·haze→wx-fog · (야간 판정 시) 맑음→wx-night · 흐림→wx-night-cloudy

## 사용
- 상태 카드 칩/메타 행에서 기온 텍스트 왼쪽에 배치. 칩 안 18px, gap 5, 기온은 Space Grotesk 600.
- 색은 다크 배경 전제. 아이보리 지도 위 단독 사용도 검증됨(대비 OK).
- 낮/밤 구분이 없으면 wx-night* 생략하고 주간 아이콘만 매핑해도 무방.
