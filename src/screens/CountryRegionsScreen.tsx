import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

import EmptyHint from '../components/ui/EmptyHint';
import StatTile from '../components/ui/StatTile';
import { COLORS } from '../constants/colors';
import { FONT } from '../constants/fonts';
import type { CollectionStackParamList } from '../navigation/CollectionStack';
import { getRegionStats, getSubregionStats } from '../services/db';
import { useMapStore } from '../store/mapStore';
import { abbrev } from '../utils/format';
import { codeToFlag } from '../utils/flag';

type Props = NativeStackScreenProps<CollectionStackParamList, 'CountryRegions'>;

/**
 * 권역별 밝힌 칸. 한 화면으로 두 레벨 처리:
 * - region 파라미터 없음 = 국가 → 시/도 목록 (행 탭 시 시/구로 드릴)
 * - region 파라미터 있음 = 그 시/도 → 시/구 목록 (말단)
 */
export default function CountryRegionsScreen({ route }: Props) {
  const { code, name, region } = route.params;
  const nav = useNavigation<NativeStackNavigationProp<CollectionStackParamList>>();
  const fogVersion = useMapStore((s) => s.fogVersion);
  const isCountryLevel = !region;

  const items = useMemo(
    () => (region == null ? getRegionStats(code) : getSubregionStats(code, region)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [code, region, fogVersion]
  );

  const totalTiles = items.reduce((sum, r) => sum + r.tiles, 0);
  const maxTiles = items.reduce((m, r) => Math.max(m, r.tiles), 0) || 1;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.head}>
        {isCountryLevel ? (
          <Text style={styles.flag}>{codeToFlag(code)}</Text>
        ) : (
          <Text style={styles.flag}>🗺️</Text>
        )}
        <Text style={styles.title}>{isCountryLevel ? name : region}</Text>
      </View>

      {items.length === 0 ? (
        <EmptyHint>
          {isCountryLevel
            ? '권역별 기록이 곧 쌓여요. (업데이트 이후 새로 밝힌 칸부터 시/도별로 모입니다 🗺️)'
            : '이 지역의 세부 기록이 아직 없어요. 더 걸어서 채워보세요 🚶'}
        </EmptyHint>
      ) : (
        <>
          <View style={styles.summary}>
            <StatTile
              value={String(items.length)}
              label={isCountryLevel ? '권역' : '세부 지역'}
              accent={COLORS.violetSoft}
            />
            <StatTile value={abbrev(totalTiles)} label="총 밝힌 칸" accent={COLORS.violetSoft} />
          </View>

          <View style={styles.list}>
            {items.map((r) => {
              const row = (
                <>
                  <View style={styles.rowTop}>
                    <Text style={styles.region} numberOfLines={1}>
                      {r.region}
                    </Text>
                    <Text style={styles.num}>{abbrev(r.tiles)}칸</Text>
                  </View>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${(r.tiles / maxTiles) * 100}%` }]} />
                  </View>
                </>
              );
              return isCountryLevel ? (
                <TouchableOpacity
                  key={r.region}
                  style={styles.rowCard}
                  activeOpacity={0.85}
                  onPress={() => nav.navigate('CountryRegions', { code, name, region: r.region })}
                >
                  {row}
                </TouchableOpacity>
              ) : (
                <View key={r.region} style={styles.rowCard}>
                  {row}
                </View>
              );
            })}
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
  title: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  summary: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  list: { gap: 12 },
  rowCard: {
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
