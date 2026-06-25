import { useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { CircleLayer, MarkerView, ShapeSource } from '@rnmapbox/maps';

import { COLORS } from '../../constants/colors';
import { CATEGORY_EMOJI, rarityColor, rarityLabel } from '../../constants/landmarks';
import { useLandmarkStore } from '../../store/landmarkStore';

interface Props {
  full: boolean; // true=이모지 핀, false=점 (줌아웃)
  showSubway: boolean; // false면 지하철 마커 숨김 (줌아웃 시 클러터 방지)
}

/** 발견한 랜드마크. 줌인=카테고리 이모지 핀, 줌아웃=점(가벼움). 색은 희귀도별. */
export default function LandmarkMarkers({ full, showSubway }: Props) {
  const discovered = useLandmarkStore((s) => s.discovered);
  const landmarks = useMemo(
    () => (showSubway ? discovered : discovered.filter((l) => l.category !== 'subway')),
    [discovered, showSubway]
  );

  const dotShape = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: landmarks.map((lm) => ({
        type: 'Feature' as const,
        properties: { rarity: lm.rarity ?? 'common' },
        geometry: { type: 'Point' as const, coordinates: [lm.lng, lm.lat] },
      })),
    }),
    [landmarks]
  );

  if (!full) {
    return (
      <ShapeSource id="lm-dots" shape={dotShape}>
        <CircleLayer
          id="lm-dots-layer"
          style={{
            circleRadius: 4,
            circleColor: [
              'match',
              ['get', 'rarity'],
              'legendary',
              COLORS.amber,
              'rare',
              COLORS.hotpink,
              COLORS.violet,
            ],
            circleStrokeColor: COLORS.ink,
            circleStrokeWidth: 1,
          }}
        />
      </ShapeSource>
    );
  }

  return (
    <>
      {landmarks.map((lm) => (
        <MarkerView
          key={lm.osmId}
          id={`lm-${lm.osmId}`}
          coordinate={[lm.lng, lm.lat]}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => Alert.alert(lm.name, rarityLabel(lm.rarity))}
            style={[
              styles.pin,
              { borderColor: rarityColor(lm.rarity) },
              lm.rarity === 'legendary' && styles.legendary,
            ]}
          >
            <Text style={styles.emoji}>{CATEGORY_EMOJI[lm.category] ?? '📍'}</Text>
          </TouchableOpacity>
        </MarkerView>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendary: { borderWidth: 3 }, // 전설은 테두리 더 두껍게(색은 rarityColor=앰버)
  emoji: { fontSize: 16 },
});
