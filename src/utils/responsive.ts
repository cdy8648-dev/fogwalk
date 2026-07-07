import { Dimensions } from 'react-native';

/**
 * 좁은 화면(아이폰 미니/SE ≈ 375pt) 대응 폰트 스케일.
 * 표준 아이폰은 390pt+ 라 여권 텍스트가 미니에서 빡빡하게 보인다.
 * 더 작은 기기는 이제 출시되지 않으므로 375 이하에서만 소폭 축소한다.
 * 앱이 세로 고정이라 모듈 로드 시 1회 판정으로 충분(회전 없음).
 */
const { width } = Dimensions.get('window');

/** 미니급(≤375pt) 좁은 화면인가. */
export const isCompactWidth = width <= 375;

/** 폰트 크기: 미니급에서 factor 배 축소(그 외 원본). */
export function fs(size: number, factor = 0.9): number {
  if (!isCompactWidth) return size;
  return Math.round(size * factor * 10) / 10;
}
