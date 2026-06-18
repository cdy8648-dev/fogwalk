import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/colors';
import { getAllDailyStats, getTileCount } from '../services/db';
import { useMapStore } from '../store/mapStore';
import { useUserStore } from '../store/userStore';
import {
  buildCumulativeTiles,
  buildHeatmapWeeks,
  type HeatCell,
} from '../utils/calendar';
import { coordToTile, tileAreaKm2 } from '../utils/h3';

const HEATMAP_WEEKS = 13;
const CUM_DAYS = 40;

function heatColor(cell?: HeatCell): string {
  if (!cell || (cell.distanceM <= 0 && cell.newTiles <= 0)) return COLORS.border;
  if (cell.newTiles > 0) return cell.newTiles >= 30 ? COLORS.lime : COLORS.limeDeep; // 발견
  return COLORS.teal; // 활동했지만 새 땅 없음
}

export default function ProfileScreen() {
  const level = useUserStore((s) => s.level);
  const levelRatio = useUserStore((s) => s.levelRatio);
  const totalXp = useUserStore((s) => s.totalXp);
  const totalDistanceM = useUserStore((s) => s.totalDistanceM);
  const streak = useUserStore((s) => s.streak);
  const film = useUserStore((s) => s.film);
  const fogVersion = useMapStore((s) => s.fogVersion);
  const currentLocation = useMapStore((s) => s.currentLocation);

  const areaKm2 = useMemo(() => {
    const count = getTileCount();
    if (count === 0) return 0;
    const lat = currentLocation?.lat ?? 37.5665;
    const lng = currentLocation?.lng ?? 126.978;
    return count * tileAreaKm2(coordToTile(lat, lng));
  }, [fogVersion, currentLocation]);

  const { weeks, cum } = useMemo(() => {
    const stats = getAllDailyStats();
    const cumSeries = buildCumulativeTiles(stats).slice(-CUM_DAYS);
    return { weeks: buildHeatmapWeeks(stats, HEATMAP_WEEKS), cum: cumSeries };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fogVersion]);

  const maxCum = cum.length ? cum[cum.length - 1].cum : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 레벨 + XP 게이지 */}
      <View style={styles.card}>
        <View style={styles.levelRow}>
          <Text style={styles.levelText}>Lv {level}</Text>
          <Text style={styles.xpText}>{Math.floor(totalXp)} XP</Text>
        </View>
        <View style={styles.gaugeTrack}>
          <View
            style={[
              styles.gaugeFill,
              { width: `${Math.min(100, Math.max(2, levelRatio * 100))}%` },
            ]}
          />
        </View>
        <Text style={styles.filmText}>🎞️ 필름 {Math.floor(film)}장</Text>
      </View>

      {/* 핵심 통계 */}
      <View style={styles.statsRow}>
        <View style={styles.statTile}>
          <Text style={styles.statNum}>{areaKm2.toFixed(2)}</Text>
          <Text style={styles.statCap}>밝힌 땅 km²</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statNum}>{(totalDistanceM / 1000).toFixed(1)}</Text>
          <Text style={styles.statCap}>총 거리 km</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statNum}>🔥 {streak}</Text>
          <Text style={styles.statCap}>연속일</Text>
        </View>
      </View>

      {/* 활동 히트맵 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>활동 ({HEATMAP_WEEKS}주)</Text>
        <View style={styles.heatRow}>
          {weeks.map((col, wi) => (
            <View key={wi} style={styles.heatCol}>
              {Array.from({ length: 7 }).map((_, dow) => (
                <View
                  key={dow}
                  style={[styles.heatCell, { backgroundColor: heatColor(col[dow]) }]}
                />
              ))}
            </View>
          ))}
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.teal }]} />
          <Text style={styles.legendText}>활동</Text>
          <View style={[styles.legendDot, { backgroundColor: COLORS.lime }]} />
          <Text style={styles.legendText}>새 땅 발견</Text>
        </View>
      </View>

      {/* 누적 성장 (우상향) */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>누적 탐험 성장</Text>
        {maxCum > 0 ? (
          <View style={styles.cumRow}>
            {cum.map((p, i) => (
              <View
                key={i}
                style={[
                  styles.cumBar,
                  { height: `${Math.max(2, (p.cum / maxCum) * 100)}%` },
                ]}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>아직 데이터가 없어요. 걸으면 채워집니다.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.fog },
  content: { padding: 16, gap: 14 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  cardTitle: { color: COLORS.muted, fontSize: 13, marginBottom: 12 },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  levelText: { color: COLORS.text, fontSize: 24, fontWeight: '800' },
  xpText: { color: COLORS.muted, fontSize: 13 },
  gaugeTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.fogLight,
    overflow: 'hidden',
  },
  gaugeFill: { height: '100%', borderRadius: 5, backgroundColor: COLORS.lime },
  filmText: { color: COLORS.amber, fontSize: 13, marginTop: 10, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statTile: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statNum: { color: COLORS.lime, fontSize: 20, fontWeight: '800' },
  statCap: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  heatRow: { flexDirection: 'row' },
  heatCol: { flexDirection: 'column' },
  heatCell: { width: 13, height: 13, margin: 1.5, borderRadius: 3 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  legendDot: { width: 10, height: 10, borderRadius: 3, marginRight: 5 },
  legendText: { color: COLORS.muted, fontSize: 11, marginRight: 14 },
  cumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 70,
    gap: 1,
  },
  cumBar: {
    flex: 1,
    backgroundColor: COLORS.limeDeep,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  empty: { color: COLORS.muted, fontSize: 13 },
});
