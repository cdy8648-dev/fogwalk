import { BlurView } from 'expo-blur';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT } from '../../constants/fonts';
import { weatherIconKey, type WeatherData } from '../../constants/weather';
import { abbrev } from '../../utils/format';
import { WeatherIcon } from './WeatherIcon';

export interface StatusLocation {
  flag: string; // 국기 이모지
  label: string; // 시/도 또는 국가명
}

interface Props {
  todayTiles: number;
  totalTiles: number;
  location?: StatusLocation | null;
  weather?: WeatherData | null;
}

/**
 * 지도 좌상단 상태 카드 — 시안 1c(칩 콜라주).
 * 코어 = '오늘 밝힌 땅' 히어로 + 누적. 날씨·위치는 스티커 칩으로 카드 모서리에 부착.
 * 데이터 없으면 칩 미렌더(폴백 — 코어 카드 레이아웃 불변). 전체 pointerEvents none.
 * 폰트: 한글=시스템, 숫자·°·K/M/B=Space Grotesk(FONT.display).
 */
export default function MapStatusCard({ todayTiles, totalTiles, location, weather }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { top: insets.top + 12 }]} pointerEvents="none">
      <View style={styles.card}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.tint} />
        <Text style={styles.label}>오늘 밝힌 땅</Text>
        <View style={styles.heroRow}>
          <Text style={styles.heroNum}>{abbrev(todayTiles)}</Text>
          <Text style={styles.heroUnit}>칸</Text>
        </View>
        <Text style={styles.total}>
          지금까지 <Text style={styles.totalNum}>{abbrev(totalTiles)}</Text>칸
        </Text>
      </View>

      {weather && (
        <View style={[styles.chip, styles.chipWeather]}>
          <WeatherIcon iconKey={weatherIconKey(weather.condition, weather.night)} size={18} />
          <Text style={styles.chipNum}>{weather.temp}°</Text>
        </View>
      )}
      {location && (
        <View style={[styles.chip, styles.chipPlace]}>
          <Text style={styles.chipText}>
            {location.flag} <Text style={styles.chipPlaceLabel}>{location.label}</Text>
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16 },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#8B7CFF',
    paddingTop: 14,
    paddingHorizontal: 18,
    paddingBottom: 13,
    transform: [{ rotate: '-2.5deg' }],
    overflow: 'hidden',
    shadowColor: '#0D0F1A',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  tint: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(13,15,26,0.82)' },
  label: { fontSize: 11, color: '#7C8294' },
  heroRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 1 },
  heroNum: { fontFamily: FONT.display, fontSize: 34, lineHeight: 34, color: '#C8F560' },
  heroUnit: { fontSize: 15, fontWeight: '700', color: '#C8F560' },
  total: { fontSize: 12, color: '#7C8294', marginTop: 6 },
  totalNum: { fontFamily: FONT.display, color: '#E2E5EE' },
  chip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0F1120',
    borderRadius: 999,
    borderWidth: 1.5,
    paddingVertical: 4,
    paddingHorizontal: 11,
    shadowColor: '#0D0F1A',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  chipWeather: { top: -13, right: -18, borderColor: '#5BC0BE', transform: [{ rotate: '4deg' }] },
  chipPlace: { bottom: -12, left: -14, borderColor: '#FF6BB5', transform: [{ rotate: '-4deg' }] },
  chipText: { fontSize: 11, color: '#E2E5EE' },
  chipNum: { fontFamily: FONT.display, fontSize: 11, color: '#E2E5EE' },
  chipPlaceLabel: { fontSize: 11, fontWeight: '600', color: '#E2E5EE' },
});
