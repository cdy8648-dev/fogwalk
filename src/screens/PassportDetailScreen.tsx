import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import EmptyHint from '../components/ui/EmptyHint';
import SectionPill from '../components/ui/SectionPill';
import StatTile from '../components/ui/StatTile';
import { COLORS } from '../constants/colors';
import { FONT } from '../constants/fonts';
import { getAllCountryStats } from '../services/db';
import { useMapStore } from '../store/mapStore';
import { codeToFlag } from '../utils/flag';
import { formatDate } from '../utils/date';

export default function PassportDetailScreen() {
  const fogVersion = useMapStore((s) => s.fogVersion);
  const countries = useMemo(() => getAllCountryStats(), [fogVersion]);
  const totalTiles = countries.reduce((sum, c) => sum + c.tiles, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionPill label="여권" color={COLORS.violet} rotate={-1.5} hint="탐험한 나라" />

      {countries.length === 0 ? (
        <EmptyHint>탐험한 나라가 여기 쌓여요. 해외에 가면 국기가 늘어납니다 🛂</EmptyHint>
      ) : (
        <>
          <View style={styles.summary}>
            <StatTile value={String(countries.length)} label="나라" accent={COLORS.violetSoft} />
            <StatTile value={String(totalTiles)} label="총 밝힌 칸" accent={COLORS.violetSoft} />
          </View>

          <View style={styles.list}>
            {countries.map((c) => (
              <View key={c.code} style={styles.card}>
                <Text style={styles.flag}>{codeToFlag(c.code)}</Text>
                <View style={styles.mid}>
                  <Text style={styles.name}>{c.name}</Text>
                  {c.firstVisitedAt > 0 && (
                    <Text style={styles.since}>{formatDate(c.firstVisitedAt)}부터 🛂</Text>
                  )}
                </View>
                <View style={styles.right}>
                  <Text style={styles.num}>{c.tiles}</Text>
                  <Text style={styles.unit}>칸</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.fog },
  content: { padding: 16, paddingBottom: 32 },
  summary: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  list: { gap: 12, marginTop: 12 },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.violet,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: { fontSize: 38, marginRight: 14 },
  mid: { flex: 1 },
  name: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  since: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  right: { alignItems: 'flex-end' },
  num: { color: COLORS.violetSoft, fontSize: 30, fontFamily: FONT.display },
  unit: { color: COLORS.violet, fontSize: 11, fontWeight: '700' },
});
