import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import EmptyHint from '../components/ui/EmptyHint';
import StatTile from '../components/ui/StatTile';
import { COLORS } from '../constants/colors';
import { FONT } from '../constants/fonts';
import type { CollectionStackParamList } from '../navigation/CollectionStack';
import { getRegionStats } from '../services/db';
import { useMapStore } from '../store/mapStore';
import { abbrev } from '../utils/format';
import { codeToFlag } from '../utils/flag';

type Props = NativeStackScreenProps<CollectionStackParamList, 'CountryRegions'>;

/** 한 국가의 권역별(시/도) 밝힌 칸. 여권 국가 카드 탭 시 진입. */
export default function CountryRegionsScreen({ route }: Props) {
  const { code, name } = route.params;
  const fogVersion = useMapStore((s) => s.fogVersion);
  const regions = useMemo(() => getRegionStats(code), [code, fogVersion]);

  const totalTiles = regions.reduce((sum, r) => sum + r.tiles, 0);
  const maxTiles = regions.reduce((m, r) => Math.max(m, r.tiles), 0) || 1;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.head}>
        <Text style={styles.flag}>{codeToFlag(code)}</Text>
        <Text style={styles.country}>{name}</Text>
      </View>

      {regions.length === 0 ? (
        <EmptyHint>
          권역별 기록이 곧 쌓여요. (업데이트 이후 새로 밝힌 칸부터 시/도별로 모입니다 🗺️)
        </EmptyHint>
      ) : (
        <>
          <View style={styles.summary}>
            <StatTile value={String(regions.length)} label="권역" accent={COLORS.violetSoft} />
            <StatTile value={abbrev(totalTiles)} label="총 밝힌 칸" accent={COLORS.violetSoft} />
          </View>

          <View style={styles.list}>
            {regions.map((r) => (
              <View key={r.region} style={styles.row}>
                <View style={styles.rowTop}>
                  <Text style={styles.region} numberOfLines={1}>
                    {r.region}
                  </Text>
                  <Text style={styles.num}>{abbrev(r.tiles)}칸</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${(r.tiles / maxTiles) * 100}%` }]} />
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
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  flag: { fontSize: 34 },
  country: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  summary: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  list: { gap: 12 },
  row: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  region: { color: COLORS.text, fontSize: 15, fontWeight: '700', flex: 1 },
  num: { color: COLORS.violetSoft, fontSize: 15, fontFamily: FONT.display, marginLeft: 8 },
  track: {
    height: 7,
    backgroundColor: COLORS.fogLight,
    borderRadius: 999,
    marginTop: 9,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: COLORS.violet, borderRadius: 999 },
});
