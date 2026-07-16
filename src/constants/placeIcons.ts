import { PLACE_ICON } from './markerSvgs';

/**
 * 나만의 장소 아이콘 — 플랫 벡터 글리프 16종(assets/markers/place).
 * DB의 places.emoji 컬럼에 '이 아이콘 id'(예: 'place-flag')를 저장한다(컬럼명은 레거시).
 * 과거에 저장된 실제 이모지 문자(🚩 등)는 LEGACY_EMOJI로 아이콘 id에 매핑해 렌더한다.
 */

// 에디터 선택 그리드 순서 (README_place.md 순서와 동일)
export const PLACE_ICON_IDS = [
  'place-flag', 'place-home', 'place-heart', 'place-star',
  'place-food', 'place-cafe', 'place-tree', 'place-scenery',
  'place-fishing', 'place-camping', 'place-gym', 'place-pet',
  'place-study', 'place-art', 'place-shopping', 'place-music',
] as const;

export const DEFAULT_PLACE_ICON = PLACE_ICON_IDS[0];

// 레거시 이모지(구버전 저장값) → 아이콘 id
const LEGACY_EMOJI: Record<string, string> = {
  '🚩': 'place-flag', '🏠': 'place-home', '❤️': 'place-heart', '⭐': 'place-star',
  '🍜': 'place-food', '☕': 'place-cafe', '🌳': 'place-tree', '🏞️': 'place-scenery',
  '🎣': 'place-fishing', '⛺': 'place-camping', '🏋️': 'place-gym', '🐶': 'place-pet',
  '📚': 'place-study', '🎨': 'place-art', '🛒': 'place-shopping', '🎵': 'place-music',
};

/**
 * 저장값 → 렌더할 아이콘 id. 슬러그면 그대로, 레거시 이모지면 매핑, 미상이면 기본값.
 * (미상 이모지도 기본 깃발로 폴백 — 지도에 항상 우리 글리프가 보이도록)
 */
export function resolvePlaceIcon(value: string | undefined | null): string {
  if (value && value in PLACE_ICON) return value;
  if (value && value in LEGACY_EMOJI) return LEGACY_EMOJI[value];
  return DEFAULT_PLACE_ICON;
}

export function placeIconXml(value: string | undefined | null): string {
  return PLACE_ICON[resolvePlaceIcon(value)];
}
