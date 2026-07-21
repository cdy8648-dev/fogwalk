import { COLORS } from './colors';

/**
 * 지도 마커 공통 규격 — 확대/축소, 발견·장소·사진 전 타입을 한 시스템으로 통일.
 * 정체성은 '색/글리프'로만 구분하고, 기하(점 크기·테두리·그림자·앵커)는 전부 공유한다.
 * (design.md 원칙: 줌아웃 시 점으로. 베이스맵은 조용하게, 우리 마커가 주인공.)
 */

// 줌아웃 점 — 발견=등급색 / 장소=핑크 / 사진=라임, 나머지 규격은 동일.
export const MARKER_DOT = {
  radius: 5,
  strokeColor: COLORS.ink,
  strokeWidth: 1.5,
} as const;

// 줌인 배경 없는 글리프 — 밝은 지도에서도 읽히도록 동일 그림자.
export const MARKER_GLYPH_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.4,
  shadowRadius: 2.5,
  shadowOffset: { width: 0, height: 1 },
} as const;

// 타입별 시그니처 색.
export const PLACE_COLOR = COLORS.hotpink;
export const PHOTO_COLOR = COLORS.lime;
