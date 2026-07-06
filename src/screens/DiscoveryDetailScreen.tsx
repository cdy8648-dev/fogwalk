import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import EmptyHint from '../components/ui/EmptyHint';
import { COLORS } from '../constants/colors';
import { FONT } from '../constants/fonts';
import { CATEGORY_EMOJI, landmarkDisplayName, rarityLabel } from '../constants/landmarks';
import type { CollectionStackParamList, DiscoveryFilter } from '../navigation/CollectionStack';
import { useLandmarkStore } from '../store/landmarkStore';
import type { Landmark } from '../types';
import { formatDate } from '../utils/date';

const FILTERS: { key: DiscoveryFilter; label: string; emoji: string }[] = [
  { key: 'all', label: '전체', emoji: '✨' },
  { key: 'park', label: '공원', emoji: '🌳' },
  { key: 'landmark', label: '랜드마크', emoji: '🏛️' },
  { key: 'peak', label: '산', emoji: '⛰️' },
  { key: 'subway', label: '지하철', emoji: '🚇' },
];

function matches(lm: Landmark, f: DiscoveryFilter): boolean {
  if (f === 'all') return true;
  if (f === 'park') return lm.category === 'park';
  if (f === 'peak') return lm.category === 'peak';
  if (f === 'subway') return lm.category === 'subway';
  // 'landmark' = 공원·산·지하철 외 나머지
  return lm.category !== 'park' && lm.category !== 'peak' && lm.category !== 'subway';
}

type Props = NativeStackScreenProps<CollectionStackParamList, 'DiscoveryDetail'>;

export default function DiscoveryDetailScreen({ route }: Props) {
  const landmarks = useLandmarkStore((s) => s.discovered);
  const [filter, setFilter] = useState<DiscoveryFilter>(route.params?.filter ?? 'all');

  const shown = landmarks.filter((lm) => matches(lm, filter));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.chips}>
        {FILTERS.map((f) => {
          const active = f.key === filter;
          return (
            <TouchableOpacity
              key={f.key}
              activeOpacity={0.8}
              onPress={() => setFilter(f.key)}
              style={[styles.chip, active && styles.chipOn]}
            >
              <Text style={[styles.chipText, active && styles.chipTextOn]}>
                {f.emoji} {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {shown.length === 0 ? (
        <EmptyHint>아직 이 분류로 발견한 곳이 없어요. 더 걸어서 안개를 걷어보세요 🗺️</EmptyHint>
      ) : (
        <View style={styles.list}>
          {shown.map((lm) => (
            <View key={lm.osmId} style={styles.row}>
              <Text style={styles.emoji}>{CATEGORY_EMOJI[lm.category] ?? '📍'}</Text>
              <View style={styles.mid}>
                <Text style={styles.name} numberOfLines={1}>
                  {landmarkDisplayName(lm)}
                </Text>
                {lm.discoveredAt ? (
                  <Text style={styles.date}>{formatDate(lm.discoveredAt)} 발견</Text>
                ) : null}
              </View>
              <Text style={styles.rarity}>{rarityLabel(lm.rarity)}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.fog },
  content: { padding: 16, paddingBottom: 110 }, // 플로팅 탭바 공간 확보
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipOn: { backgroundColor: COLORS.amber, borderColor: COLORS.amber },
  chipText: { color: COLORS.muted, fontSize: 13, fontWeight: '700' },
  chipTextOn: { color: COLORS.ink },
  list: { gap: 8, marginTop: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  emoji: { fontSize: 22, marginRight: 12 },
  mid: { flex: 1 },
  name: { color: COLORS.text, fontSize: 15 },
  date: { color: COLORS.muted, fontSize: 11, marginTop: 2, fontFamily: FONT.mono },
  rarity: { color: COLORS.amber, fontSize: 12, fontWeight: '700', marginLeft: 8 },
});
