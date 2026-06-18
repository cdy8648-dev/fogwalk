import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { MarkerView } from '@rnmapbox/maps';

import { COLORS } from '../../constants/colors';
import { CATEGORY_EMOJI, rarityLabel } from '../../constants/landmarks';
import { useLandmarkStore } from '../../store/landmarkStore';

/** 발견한 랜드마크를 지도에 카테고리 이모지 핀으로 표시. 탭하면 이름·희귀도. */
export default function LandmarkMarkers() {
  const landmarks = useLandmarkStore((s) => s.discovered);

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
            style={[styles.pin, lm.rarity === 'legendary' && styles.legendary]}
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
    borderColor: COLORS.violet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendary: { borderColor: COLORS.amber, borderWidth: 3 },
  emoji: { fontSize: 16 },
});
