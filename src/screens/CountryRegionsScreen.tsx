import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

import EmptyHint from '../components/ui/EmptyHint';
import StatTile from '../components/ui/StatTile';
import { COLORS } from '../constants/colors';
import { FONT } from '../constants/fonts';
import { KR_TOTAL_AREA_KM2, regionAreaKm2 } from '../constants/regionAreas';
import type { CollectionStackParamList } from '../navigation/CollectionStack';
import { getRegionStats, getSubregionStats } from '../services/db';
import { useMapStore } from '../store/mapStore';
import { abbrev } from '../utils/format';
import { codeToFlag } from '../utils/flag';
import { TILE_AREA_KM2 } from '../utils/h3';

/** 밝힌 칸 수 → 권역 면적 대비 달성률(%). 면적 미상이면 null. */
function completionPct(tiles: number, areaKm2: number | null): number | null {
  if (!areaKm2) return null;
  return (tiles * TILE_AREA_KM2) / areaKm2 * 100;
}

/** 작은 값도 읽히게: 10%↑ 정수, 1%↑ 소수1, 그 외 소수2. */
function formatPct(pct: number): string {
  if (pct >= 10) return `${Math.round(pct)}%`;
  if (pct >= 1) return `${pct.toFixed(1)}%`;
  if (pct < 0.01) return '<0.01%';
  return `${pct.toFixed(2)}%`;
}

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
  // 시/도 목록(국가 레벨)에서만 면적 기반 달성률을 쓴다. 시/구·해외는 칸 수.
  const overallPct =
    isCountryLevel && code === 'KR'
      ? completionPct(totalTiles, KR_TOTAL_AREA_KM2)
      : null;

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
            {overallPct != null && (
              <StatTile value={formatPct(overallPct)} label="국토 달성률" accent={COLORS.lime} />
            )}
            <StatTile value={abbrev(totalTiles)} label="총 밝힌 칸" accent={COLORS.violetSoft} />
          </View>

          <View style={styles.list}>
            {items.map((r) => {
              const area = isCountryLevel ? regionAreaKm2(code, r.region) : null;
              const pct = completionPct(r.tiles, area);
              // 면적 기반이면 바 = 달성률(100% 상한), 아니면 권역간 상대 비교.
              const fillWidth =
                pct != null ? Math.min(pct, 100) : (r.tiles / maxTiles) * 100;
              const row = (
                <>
                  <View style={styles.rowTop}>
                    <Text style={styles.region} numberOfLines={1}>
                      {r.region}
                    </Text>
                    {pct != null ? (
                      <View style={styles.rowRight}>
                        <Text style={styles.pct}>{formatPct(pct)}</Text>
                        <Text style={styles.sub}>{abbrev(r.tiles)}칸</Text>
                      </View>
                    ) : (
                      <Text style={styles.num}>{abbrev(r.tiles)}칸</Text>
                    )}
                  </View>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${fillWidth}%` }]} />
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
  content: { padding: 16, paddingBottom: 110 }, // 플로팅 탭바 공간 확보
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
  rowRight: { alignItems: 'flex-end', marginLeft: 8 },
  pct: { color: COLORS.lime, fontSize: 16, fontFamily: FONT.display },
  sub: { color: COLORS.muted, fontSize: 11, fontFamily: FONT.mono, marginTop: 1 },
  track: {
    height: 7,
    backgroundColor: COLORS.fogLight,
    borderRadius: 999,
    marginTop: 9,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: COLORS.violet, borderRadius: 999 },
});
