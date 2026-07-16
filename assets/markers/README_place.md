# FogWalk — "나만의 장소" 마커 아이콘 16종 (플랫 벡터)

## Overview
"나만의 장소" 기능의 지도 마커 글리프 16종. 기존 이모지 마커를 교체하는 프로덕션 에셋 — **재구현 금지, SVG 그대로 사용.** react-native-svg 호환 규격으로 제작됨.

## 기술 규격 (검증 완료)
- viewBox 0 0 200 200, 투명 배경, 배경원/테두리 없음 — 지도 위에 모티프만 얹힘
- fill만 사용 (stroke 없음), 그라디언트·필터·id 속성 없음
- 모티프는 y 48~152 중앙 영역, 하단은 마커 꼬리 여백
- 24px 축소 가독성 확인 완료

## 컬러 시스템
- 잉크(주 실루엣): #1D2748
- 핫핑크(시리즈 시그니처, 매 아이콘 1회): #FF6BB5
- 보조 1색: 라임 #C8F560 · 바이올렛 #8B7CFF · 골드 #E0A458 · 틸 #5BC0BE · 크림 #F4EFE6

## 파일 목록 (place/<slug>.svg)
place-flag 깃발 · place-home 집 · place-heart 하트 · place-star 별 · place-food 맛집(국수) · place-cafe 카페 · place-tree 나무 · place-scenery 풍경 · place-fishing 낚시 · place-camping 캠핑 · place-gym 운동 · place-pet 반려동물(발자국) · place-study 공부 · place-art 예술 · place-shopping 쇼핑 · place-music 음악

## 사용
- 기존 이모지 마커를 슬러그 매핑으로 1:1 교체 (🚩→place-flag, 🏠→place-home, ❤️→place-heart, ⭐→place-star, 🍜→place-food, ☕→place-cafe, 🌳→place-tree, 🏞️→place-scenery, 🎣→place-fishing, ⛺→place-camping, 🏋️→place-gym, 🐶→place-pet, 📚→place-study, 🎨→place-art, 🛒→place-shopping, 🎵→place-music)
- 권장 렌더 크기 44px, 탭 히트 영역 44×44pt 이상
- 라이트(아이보리) 지도 전용 — 다크 배경 사용 시 대비 확인 필요
