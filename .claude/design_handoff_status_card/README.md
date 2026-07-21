# Handoff: 지도 "내가 밝힌 땅" 상태 카드 — 시안 1c 칩 콜라주

## Overview
FogWalk(RN/Expo, Mapbox) 지도 좌측 상단 글래스 상태 카드의 발전형. 채택안 **1c**: 코어 카드는 "오늘 밝힌 땅" 히어로 숫자 + 누적만 담고, **날씨·위치를 스티커 칩으로 카드 모서리에 부착**하는 콜라주 구조.

## About the Design Files
`FogWalk 밝힌 땅 카드.dc.html`은 HTML로 제작된 디자인 레퍼런스다(1a/1b는 비교용, **1c 섹션이 채택안**). 그대로 복사하지 말고 RN 코드베이스의 기존 패턴으로 재구현할 것.

## Fidelity
High-fidelity — 색·크기·회전·오프셋 값은 최종안. 값은 아래 스펙 기준.

## Structure
```
<View overlay 좌상단, pointerEvents="none">   ← 기존과 동일
  <View 코어 카드 (rotate -2.5°)>
    라벨 / 히어로 / 누적
  </View>
  <칩: 날씨>   카드 우상단 모서리에 겹침
  <칩: 위치>   카드 좌하단 모서리에 겹침
</View>
```

## Spec

### 코어 카드
- BlurView intensity 40 dark + tint `rgba(13,15,26,.82)`
- border 1.5 `#8B7CFF`, borderRadius 16, rotate `-2.5deg`
- padding: 14 top / 18 horizontal / 13 bottom
- shadow: `0 10px 28px rgba(13,15,26,.35)` (RN: shadowColor #0D0F1A, opacity .35, radius 14, offset {0,10})
- 폭 고정 없음(내용 맞춤) — 기존과 동일
- 워시테이프 조각은 제거 (칩이 그 역할 대체) — 유지 원하면 기존 그대로 둬도 무방

### 텍스트 (한글=시스템 폰트, 숫자·°·K/M/B=Space Grotesk)
1. 라벨 `오늘 밝힌 땅` — 시스템 11, `#7C8294`
2. 히어로 — 행: baseline 정렬, gap 4, marginTop 1
   - 숫자 `120` — Space Grotesk Bold 34, `#C8F560`, lineHeight 34
   - 단위 `칸` — 시스템 15/700, `#C8F560`
3. 누적 `지금까지 12.3K칸` — 시스템 12, `#7C8294`, marginTop 6
   - 숫자 `12.3K`만 Space Grotesk 600, `#E2E5EE` (K/M/B 축약 규칙)

### 칩 (공통)
- 배경 `#0F1120` (불투명 — 블러 없음), borderRadius 999, border 1.5
- padding: 4 vertical / 11 horizontal
- shadow `0 4px 12px rgba(13,15,26,.4)`
- 텍스트 시스템 11 `#E2E5EE`, 숫자+°만 Space Grotesk 600
- **날씨 칩**: border `#5BC0BE`, 내용 `☀️ 24°`, 위치: 카드 우상단 — top -13 / right -18, rotate `+4deg`
- **위치 칩**: border `#FF6BB5`, 내용 `🇰🇷 서울` (fontWeight 600), 위치: 카드 좌하단 — bottom -12 / left -14, rotate `-4deg`
- 칩이 카드보다 위 레이어 (zIndex)

### RN StyleSheet 참고값
```js
const S = StyleSheet.create({
  wrap: { position:'absolute', top: insets.top + 12, left: 16 },
  card: { borderRadius:16, borderWidth:1.5, borderColor:'#8B7CFF',
    paddingTop:14, paddingHorizontal:18, paddingBottom:13,
    transform:[{rotate:'-2.5deg'}], overflow:'hidden',
    shadowColor:'#0D0F1A', shadowOpacity:.35, shadowRadius:14, shadowOffset:{width:0,height:10}, elevation:8 },
  label: { fontSize:11, color:'#7C8294' },
  heroRow: { flexDirection:'row', alignItems:'baseline', gap:4, marginTop:1 },
  heroNum: { fontFamily:'SpaceGrotesk-Bold', fontSize:34, lineHeight:34, color:'#C8F560' },
  heroUnit: { fontSize:15, fontWeight:'700', color:'#C8F560' },
  total: { fontSize:12, color:'#7C8294', marginTop:6 },
  totalNum: { fontFamily:'SpaceGrotesk-SemiBold', color:'#E2E5EE' },
  chip: { position:'absolute', flexDirection:'row', alignItems:'center', gap:5,
    backgroundColor:'#0F1120', borderRadius:999, borderWidth:1.5,
    paddingVertical:4, paddingHorizontal:11,
    shadowColor:'#0D0F1A', shadowOpacity:.4, shadowRadius:6, shadowOffset:{width:0,height:4}, elevation:6 },
  chipWeather: { top:-13, right:-18, borderColor:'#5BC0BE', transform:[{rotate:'4deg'}] },
  chipPlace: { bottom:-12, left:-14, borderColor:'#FF6BB5', transform:[{rotate:'-4deg'}] },
  chipText: { fontSize:11, color:'#E2E5EE' },
  chipNum: { fontFamily:'SpaceGrotesk-SemiBold', fontSize:11, color:'#E2E5EE' },
});
```

## Behavior
- **폴백**: 날씨/위치 데이터 없으면(권한 전·오프라인) 해당 칩을 렌더하지 않음 — 코어 카드는 불변이라 레이아웃 시프트 없음.
- **등장(선택)**: 데이터 도착 시 칩이 scale 0.6→1 스프링(약 300ms)으로 "붙는" 연출. Reanimated spring 권장, 없어도 무방.
- 날씨 아이콘 매핑: 맑음☀️ 구름☁️ 흐림🌥️ 비🌧️ 눈🌨️ 뇌우⛈️ 안개🌫️ (이모지 그대로 사용).
- 기존 pointerEvents none 유지.
- 큰 수 축약: 1000 미만 그대로, 이후 K/M/B 소수 1자리 (12339 → 12.3K).

## Out of Scope
- 지도/안개 렌더링, 위치·날씨 데이터 페칭 로직 (기존 앱)
- 1a/1b 시안 (미채택)
