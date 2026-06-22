export interface MapStylePreset {
  id: string;
  label: string;
  styleURL: string; // 'mapbox://styles/mapbox/...' 또는 커스텀 'mapbox://styles/<계정>/<id>'
}

/**
 * 사용 가능한 지도 스타일 단일 진실 소스.
 * 새 커스텀 스타일은 여기에 한 줄 추가하면 끝.
 */
export const MAP_STYLES: MapStylePreset[] = [
  // 커스텀(아이보리 베이스 · POI/상점 라벨 정리) — 기본 스타일
  {
    id: 'ivory',
    label: '아이보리 탐험',
    styleURL: 'mapbox://styles/chadyoung/cmqp80yuc007x01rg6irz0c09',
  },
  { id: 'street', label: '기본', styleURL: 'mapbox://styles/mapbox/streets-v12' },
  { id: 'light', label: '라이트', styleURL: 'mapbox://styles/mapbox/light-v11' },
  { id: 'dark', label: '다크', styleURL: 'mapbox://styles/mapbox/dark-v11' },
];

export const DEFAULT_MAP_STYLE_ID = 'ivory';

/** id로 프리셋 조회. 없으면 첫 번째(안전 폴백). */
export function getMapStyle(id: string): MapStylePreset {
  return MAP_STYLES.find((s) => s.id === id) ?? MAP_STYLES[0];
}
