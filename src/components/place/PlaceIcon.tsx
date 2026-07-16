import { View, type StyleProp, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { placeIconXml } from '../../constants/placeIcons';

/**
 * 나만의 장소 아이콘 렌더 — 저장값(슬러그/레거시 이모지)을 플랫 글리프 SVG로.
 * 배경 없는 글리프라 밝은 지도 대비용 그림자는 호출측(마커)에서 씌운다.
 */
export function PlaceIcon({
  value,
  size,
  style,
}: {
  value: string | undefined | null;
  size: number;
  style?: StyleProp<ViewStyle>;
}) {
  const xml = placeIconXml(value);
  if (!xml) return <View style={[{ width: size, height: size }, style]} />;
  return <SvgXml xml={xml} width={size} height={size} style={style} />;
}
