import type { LandmarkCategory } from '../types';
import type { DiscoveryFilter } from '../navigation/CollectionStack';

/**
 * 발견 카테고리 ↔ 마커 아이콘 에셋(assets/markers manifest id) 매핑.
 * 코인(MARKER_COIN) = 카드·필터·상세 등 크게 보이는 곳, 글리프(MARKER_GLYPH) = 지도 마커·리스트 셀.
 * 미사용 에셋(market/lake/beach/forest/cablecar)은 향후 카테고리 확장용으로 번들에 유지.
 */
export const CATEGORY_ICON: Record<LandmarkCategory, string> = {
  palace: 'detail-palace',
  temple: 'detail-temple',
  tower: 'detail-tower',
  historic: 'detail-ruins',
  monument: 'detail-monument',
  museum: 'detail-museum',
  bridge: 'detail-bridge',
  attraction: 'detail-landmark',
  park: 'detail-park',
  peak: 'detail-mountain',
  subway: 'detail-metro',
  train: 'detail-station',
  airport: 'detail-airport',
  port: 'detail-harbor',
  other: 'detail-pin',
};

/** 발견 필터 칩·타일용 코인 — 전체 + 4대분류(건축·문화/자연/교통/기타). */
export const FILTER_ICON: Record<DiscoveryFilter, string> = {
  all: 'filter-all',
  culture: 'filter-culture',
  nature: 'filter-nature',
  transport: 'filter-transport',
  etc: 'filter-etc',
};

/** 글리프 배경원 색 (에셋 README 규칙 — 라이트 배경 단독 사용 금지). */
export const GLYPH_BG = '#1D2748';
