import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { WEATHER_SVG } from '../../constants/weatherSvgs';

/** 날씨 아이콘 (assets/weather 벡터 9종). iconKey = 'wx-sunny' 등. */
export function WeatherIcon({ iconKey, size }: { iconKey: string; size: number }) {
  const xml = WEATHER_SVG[iconKey];
  if (!xml) return <View style={{ width: size, height: size }} />;
  return <SvgXml xml={xml} width={size} height={size} />;
}
