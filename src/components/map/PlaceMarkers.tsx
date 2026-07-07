import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MarkerView } from '@rnmapbox/maps';

import { COLORS } from '../../constants/colors';
import { usePlaceStore } from '../../store/placeStore';
import type { Place } from '../../types';

interface Props {
  visible: boolean; // 줌 게이트 (사진 마커와 동일 레벨)
  hideId?: string | null; // 이동 모드 중인 장소는 숨김 (드래그 핀으로 대체 표시)
  onSelect: (place: Place) => void;
}

/** 나만의 장소 마커 — 이모지 핀 + 이름 칩. 탭하면 상세 카드. */
export default function PlaceMarkers({ visible, hideId, onSelect }: Props) {
  const places = usePlaceStore((s) => s.places);
  if (!visible) return null;

  return (
    <>
      {places
        .filter((p) => p.id !== hideId)
        .map((p) => (
          <MarkerView
            key={p.id}
            id={`place-${p.id}`}
            coordinate={[p.lng, p.lat]}
            anchor={{ x: 0.5, y: 1 }}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => onSelect(p)}
              style={styles.wrap}
              accessibilityLabel={`나만의 장소 ${p.name}`}
            >
              <View style={styles.pin}>
                <Text style={styles.emoji}>{p.emoji}</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText} numberOfLines={1}>
                  {p.name}
                </Text>
              </View>
            </TouchableOpacity>
          </MarkerView>
        ))}
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  pin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.violet, // 개인 라벨 = 네온퍼플 (발견 마커와 구분)
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.violet,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  emoji: { fontSize: 17 },
  chip: {
    marginTop: 3,
    maxWidth: 96,
    backgroundColor: 'rgba(15,17,32,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(139,124,255,0.5)',
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  chipText: { color: COLORS.text, fontSize: 10, fontWeight: '700' },
});
