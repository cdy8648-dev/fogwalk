import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Card from '../components/ui/Card';
import StatTile from '../components/ui/StatTile';
import { COLORS } from '../constants/colors';
import { FONT } from '../constants/fonts';
import { getAllDailyStats, getTileCount } from '../services/db';
import { useMapStore } from '../store/mapStore';
import { useUserStore } from '../store/userStore';
import {
  buildCumulativeTiles,
  buildYearHeatmapWeeks,
  type HeatCell,
} from '../utils/calendar';
import { coordToTile, tileAreaKm2 } from '../utils/h3';

const YEAR = new Date().getFullYear();
const CUM_DAYS = 40;

function heatColor(cell?: HeatCell): string {
  if (!cell) return 'transparent'; // 연도 밖 패딩 칸
  if (cell.distanceM <= 0 && cell.newTiles <= 0) return COLORS.border;
  if (cell.newTiles > 0) return cell.newTiles >= 30 ? COLORS.lime : COLORS.limeDeep;
  return COLORS.teal;
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
    return {
      weeks: buildYearHeatmapWeeks(stats, YEAR),
      cum: buildCumulativeTiles(stats).slice(-CUM_DAYS),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fogVersion]);

  // 월이 바뀌는 첫 주 열에만 '5월' 같은 라벨. 나머지는 빈 문자열.
  const monthLabels = useMemo(
    () =>
      weeks.map((col, i) => {
        const cell = col.find((c) => c);
        if (!cell) return '';
        const m = new Date(cell.date).getMonth();
        const prev = weeks[i - 1]?.find((c) => c);
        const prevM = prev ? new Date(prev.date).getMonth() : -1;
        return m !== prevM ? `${m + 1}월` : '';
      }),
    [weeks]
  );

  const maxCum = cum.length ? cum[cum.length - 1].cum : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
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
      </Card>

      <View style={styles.statsRow}>
        <StatTile value={areaKm2.toFixed(2)} label="밝힌 땅 km²" />
        <StatTile value={(totalDistanceM / 1000).toFixed(1)} label="총 거리 km" />
        <StatTile value={`🔥 ${streak}`} label="연속일" />
      </View>

      <Card>
        <Text style={styles.yearTitle}>{YEAR}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.monthRow}>
              {monthLabels.map((label, wi) => (
                <View key={wi} style={styles.monthSlot}>
                  <Text style={styles.monthLabel} numberOfLines={1}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>
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
          </View>
        </ScrollView>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.teal }]} />
          <Text style={styles.legendText}>활동</Text>
          <View style={[styles.legendDot, { backgroundColor: COLORS.lime }]} />
          <Text style={styles.legendText}>새 땅 발견</Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>누적 탐험 성장</Text>
        {maxCum > 0 ? (
          <View style={styles.cumRow}>
            {cum.map((p, i) => (
              <View
                key={i}
                style={[styles.cumBar, { height: `${Math.max(2, (p.cum / maxCum) * 100)}%` }]}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>아직 데이터가 없어요. 걸으면 채워집니다.</Text>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.fog },
  content: { padding: 16, gap: 14 },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  levelText: { color: COLORS.text, fontSize: 28, fontFamily: FONT.display },
  xpText: { color: COLORS.muted, fontSize: 14, fontFamily: FONT.display },
  gaugeTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.fogLight,
    overflow: 'hidden',
  },
  gaugeFill: { height: '100%', borderRadius: 5, backgroundColor: COLORS.lime },
  filmText: { color: COLORS.amber, fontSize: 13, marginTop: 10, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 10 },
  cardTitle: { color: COLORS.muted, fontSize: 13, marginBottom: 12 },
  yearTitle: { color: COLORS.text, fontSize: 22, fontFamily: FONT.display, marginBottom: 10 },
  monthRow: { flexDirection: 'row', marginBottom: 3 },
  monthSlot: { width: 16, overflow: 'visible' },
  monthLabel: { color: COLORS.muted, fontSize: 9, width: 36, fontFamily: FONT.mono },
  heatRow: { flexDirection: 'row' },
  heatCol: { flexDirection: 'column' },
  heatCell: { width: 13, height: 13, margin: 1.5, borderRadius: 3 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  legendDot: { width: 10, height: 10, borderRadius: 3, marginRight: 5 },
  legendText: { color: COLORS.muted, fontSize: 11, marginRight: 14 },
  cumRow: { flexDirection: 'row', alignItems: 'flex-end', height: 70, gap: 1 },
  cumBar: {
    flex: 1,
    backgroundColor: COLORS.limeDeep,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  empty: { color: COLORS.muted, fontSize: 13 },
});
