/**
 * 지도 스타일 = 두 모드. "나만의 커스텀 지도"를 위해 라벨을 최소화한다.
 *  - explore: 기본. 국가/주요도시 정도만 보이는 탐험 모드(라벨 최소).
 *  - detail : 도로·지명 등 상세 라벨 정보 보기 모드.
 * 커스텀 스타일(Mapbox Studio)에서 라벨 레이어를 정리한 두 스타일 URL만 관리.
 */
export const MAP_STYLES = {
  explore: 'mapbox://styles/chadyoung/cmqp80yuc007x01rg6irz0c09',
  detail: 'mapbox://styles/chadyoung/cmrup7fpf00fb01qt66p21tgh',
} as const;

export type MapStyleMode = keyof typeof MAP_STYLES;

export const DEFAULT_MAP_STYLE_MODE: MapStyleMode = 'explore';

/** 저장값을 안전한 모드로 정규화 (구버전 'ivory' 등 알 수 없는 값 → explore). */
export function normalizeMapStyleMode(v: string | null | undefined): MapStyleMode {
  return v === 'detail' ? 'detail' : 'explore';
}
