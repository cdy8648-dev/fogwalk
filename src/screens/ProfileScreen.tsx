import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import EmptyHint from '../components/ui/EmptyHint';
import SectionPill from '../components/ui/SectionPill';
import { COLORS } from '../constants/colors';
import { FONT } from '../constants/fonts';
import { milestoneState } from '../constants/milestones';
import { getAllDailyStats } from '../services/db';
import { useMapStore } from '../store/mapStore';
import { useUserStore } from '../store/userStore';
import {
  buildMonthCalendar,
  buildMonthlyHistory,
  localDateStr,
  type CalCell,
} from '../utils/calendar';
import { comma } from '../utils/format';
import { coordToTile, tileAreaKm2 } from '../utils/h3';

const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_ABBR = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MEDALS = ['🥇', '🥈', '🥉'];
const TODAY_STR = localDateStr(new Date());

// 캘린더 한 칸 배경색: 새 땅 발견=라임, 활동만=틸, 무활동=어두운 면.
function calBg(cell: CalCell): string {
  if (cell.newTiles > 0) return cell.newTiles >= 30 ? COLORS.lime : COLORS.limeDeep;
  if (cell.distanceM > 0) return COLORS.teal;
  return COLORS.inset;
}
function calInk(cell: CalCell): string {
  return cell.newTiles > 0 || cell.distanceM > 0 ? COLORS.ink : COLORS.muted;
}

// 레벨에 따른 칭호 (정체성 카드).
function levelTitle(level: number): string {
  if (level >= 15) return '안개 정복자';
  if (level >= 10) return '길 위의 방랑자';
  if (level >= 6) return '안개를 걷는 자';
  if (level >= 3) return '동네 탐험가';
  return '첫 발자국';
}

// 'YYYY-MM' → 'JUN 2026'
function monthLabel(ym: string): string {
  const [y, m] = ym.split('-');
  return `${MONTH_ABBR[Number(m) - 1]} ${y}`;
}

export default function ProfileScreen() {
  const level = useUserStore((s) => s.level);
  const levelRatio = useUserStore((s) => s.levelRatio);
  const totalXp = useUserStore((s) => s.totalXp);
  const streak = useUserStore((s) => s.streak);
  const fogVersion = useMapStore((s) => s.fogVersion);
  const currentLocation = useMapStore((s) => s.currentLocation);
  const tiles = useMapStore((s) => s.visitedTileIds.size);

  const perTileKm2 = useMemo(() => {
    const lat = currentLocation?.lat ?? 37.5665;
    const lng = currentLocation?.lng ?? 126.978;
    return tileAreaKm2(coordToTile(lat, lng));
  }, [currentLocation]);

  const areaKm2 = tiles * perTileKm2;
  const goal = milestoneState(tiles);
  const goalPct = goal.maxed ? 100 : Math.round(goal.ratio * 100);

  // 캘린더로 보는 달 (기본 = 이번 달).
  const now = new Date();
  const [cal, setCal] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const canNext = cal.y < now.getFullYear() || (cal.y === now.getFullYear() && cal.m < now.getMonth());
  const shiftMonth = (delta: number) =>
    setCal((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const { months, activeDays } = useMemo(() => {
    const stats = getAllDailyStats();
    return {
      months: buildMonthlyHistory(stats),
      activeDays: stats.filter((s) => s.distanceM > 0).length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fogVersion]);

  const calWeeks = useMemo(
    () => buildMonthCalendar(getAllDailyStats(), cal.y, cal.m),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fogVersion, cal.y, cal.m]
  );

  // 월별 메달: 총 거리 상위 3개월.
  const medalByYm = useMemo(() => {
    const ranked = [...months].sort((a, b) => b.distanceM - a.distanceM);
    const map: Record<string, string> = {};
    ranked.slice(0, 3).forEach((m, i) => (map[m.ym] = MEDALS[i]));
    return map;
  }, [months]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>PROFILE</Text>
      <Text style={styles.title}>내 탐험 기록</Text>

      {/* 정체성 카드 */}
      <View style={styles.idCard}>
        <View style={styles.idTape} />
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>🧭</Text>
        </View>
        <View style={styles.idRight}>
          <Text style={styles.nickname}>{levelTitle(level)}</Text>
          <View style={styles.levelRow}>
            <Text style={styles.levelText}>Lv {level}</Text>
            <View style={styles.gaugeTrack}>
              <View
                style={[
                  styles.gaugeFill,
                  { width: `${Math.min(100, Math.max(3, levelRatio * 100))}%` },
                ]}
              />
            </View>
            <Text style={styles.xpText}>{comma(Math.floor(totalXp))} XP</Text>
          </View>
        </View>
      </View>

      {/* 활동 */}
      <SectionPill label="활동" color={COLORS.lime} rotate={-2} hint="월별 활동" />
      <View style={styles.actCard}>
        <View style={styles.actHead}>
          <View style={styles.actAvatar}>
            <Text style={styles.actAvatarEmoji}>🗺️</Text>
          </View>
          <View>
            <Text style={styles.actTitle}>땅 넓히기</Text>
            <Text style={styles.actSub}>
              {goal.maxed ? '모든 목표 달성 🎉' : `목표: ${comma(goal.target)}칸 발견`}
            </Text>
          </View>
        </View>

        <View style={styles.actStats}>
          <View>
            <Text style={styles.actNum}>
              {activeDays}
              <Text style={styles.actUnit}> 일</Text>
            </Text>
            <Text style={styles.actLabel}>누적 활동</Text>
          </View>
          <View>
            <Text style={[styles.actNum, { color: COLORS.lime }]}>
              {goalPct}
              <Text style={styles.actUnit}>%</Text>
            </Text>
            <Text style={styles.actLabel}>목표 진행률</Text>
          </View>
          <View>
            <Text style={[styles.actNum, { color: COLORS.amber }]}>🔥{streak}</Text>
            <Text style={styles.actLabel}>연속일</Text>
          </View>
        </View>

        {/* 월 캘린더 */}
        <View style={styles.calHeader}>
          <TouchableOpacity onPress={() => shiftMonth(-1)} hitSlop={10} style={styles.calArrow}>
            <Ionicons name="chevron-back" size={18} color={COLORS.muted} />
          </TouchableOpacity>
          <Text style={styles.calTitle}>
            {cal.y}년 {cal.m + 1}월
          </Text>
          <TouchableOpacity
            onPress={() => canNext && shiftMonth(1)}
            hitSlop={10}
            style={styles.calArrow}
            disabled={!canNext}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={canNext ? COLORS.muted : COLORS.border}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.calDowRow}>
          {DOW.map((d) => (
            <Text key={d} style={styles.calDow}>
              {d}
            </Text>
          ))}
        </View>

        {calWeeks.map((week, wi) => (
          <View key={wi} style={styles.calWeek}>
            {week.map((cell, di) => {
              if (!cell) return <View key={di} style={styles.calCellEmpty} />;
              const isToday = cell.date === TODAY_STR;
              return (
                <View
                  key={di}
                  style={[
                    styles.calCell,
                    { backgroundColor: calBg(cell) },
                    isToday && styles.calCellToday,
                  ]}
                >
                  <Text style={[styles.calDay, { color: calInk(cell) }]}>{cell.day}</Text>
                </View>
              );
            })}
          </View>
        ))}

        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.teal }]} />
          <Text style={styles.legendText}>활동</Text>
          <View style={[styles.legendDot, { backgroundColor: COLORS.lime }]} />
          <Text style={styles.legendText}>새 땅 발견</Text>
        </View>
      </View>

      {/* History */}
      <SectionPill label="History" color={COLORS.violet} rotate={1.5} hint="월별 기록" />
      {months.length === 0 ? (
        <EmptyHint>걸은 기록이 월별로 여기 쌓여요. 오늘부터 시작해볼까요 👣</EmptyHint>
      ) : (
        <View style={styles.histList}>
          {months.map((m, i) => (
            <View
              key={m.ym}
              style={[styles.histCard, { transform: [{ rotate: i % 2 === 0 ? '-1deg' : '1deg' }] }]}
            >
              <View style={styles.histTop}>
                <Text style={styles.histMonth}>{monthLabel(m.ym)}</Text>
                <Text style={styles.histMedal}>{medalByYm[m.ym] ?? ''}</Text>
              </View>
              <View style={styles.histStats}>
                <View>
                  <Text style={styles.histNum}>
                    {(m.distanceM / 1000).toFixed(1)}
                    <Text style={styles.histUnit}> km</Text>
                  </Text>
                  <Text style={styles.histLabel}>총 거리</Text>
                </View>
                <View style={styles.histDivider} />
                <View>
                  <Text style={[styles.histNum, { color: COLORS.teal }]}>
                    {(m.newTiles * perTileKm2).toFixed(2)}
                    <Text style={styles.histUnit}> km²</Text>
                  </Text>
                  <Text style={styles.histLabel}>밝힌 땅</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 전체 밝힌 땅(누계) 참고 */}
      <Text style={styles.totalNote}>지금까지 밝힌 땅 {areaKm2.toFixed(2)} km²</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.fog },
  content: { padding: 16, paddingBottom: 32 },
  kicker: { color: COLORS.muted, fontSize: 12, letterSpacing: 2, marginTop: 2, fontFamily: FONT.mono },
  title: { color: COLORS.text, fontSize: 25, fontWeight: '800', marginTop: 2, marginBottom: 16 },

  // 정체성 카드
  idCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    transform: [{ rotate: '-1deg' }],
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 10 },
  },
  idTape: {
    position: 'absolute',
    top: -9,
    right: 24,
    width: 54,
    height: 18,
    borderRadius: 2,
    backgroundColor: 'rgba(255,184,48,0.5)',
    transform: [{ rotate: '5deg' }],
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: COLORS.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 30 },
  idRight: { flex: 1, minWidth: 0 },
  nickname: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 7 },
  levelText: { color: COLORS.lime, fontSize: 14, fontFamily: FONT.display },
  gaugeTrack: { flex: 1, height: 8, backgroundColor: COLORS.fogLight, borderRadius: 999, overflow: 'hidden' },
  gaugeFill: { height: '100%', borderRadius: 999, backgroundColor: COLORS.lime },
  xpText: { color: COLORS.muted, fontSize: 11, fontFamily: FONT.mono },

  // 활동 카드
  actCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 8 },
  },
  actHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actAvatarEmoji: { fontSize: 20 },
  actTitle: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  actSub: { color: COLORS.muted, fontSize: 11, marginTop: 1 },
  actStats: { flexDirection: 'row', gap: 26, marginTop: 18 },
  actNum: { color: COLORS.text, fontSize: 28, fontFamily: FONT.display },
  actUnit: { color: COLORS.muted, fontSize: 13, fontFamily: FONT.mono },
  actLabel: { color: COLORS.muted, fontSize: 11, marginTop: 3 },

  // 월 캘린더
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 10,
  },
  calArrow: { padding: 4 },
  calTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  calDowRow: { flexDirection: 'row', marginBottom: 6 },
  calDow: { flex: 1, textAlign: 'center', color: COLORS.muted, fontSize: 11, fontFamily: FONT.mono },
  calWeek: { flexDirection: 'row' },
  calCell: {
    flex: 1,
    aspectRatio: 1,
    margin: 2.5,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calCellEmpty: { flex: 1, aspectRatio: 1, margin: 2.5 },
  calCellToday: { borderWidth: 2, borderColor: COLORS.amber },
  calDay: { fontSize: 13, fontWeight: '700' },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  legendDot: { width: 10, height: 10, borderRadius: 3, marginRight: 5 },
  legendText: { color: COLORS.muted, fontSize: 11, marginRight: 14 },

  // History
  histList: { gap: 11 },
  histCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 17,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 8 },
  },
  histTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  histMonth: { color: COLORS.muted, fontSize: 12, letterSpacing: 1, fontFamily: FONT.mono },
  histMedal: { fontSize: 14 },
  histStats: { flexDirection: 'row', alignItems: 'center', gap: 22, marginTop: 9 },
  histNum: { color: COLORS.text, fontSize: 23, fontFamily: FONT.display },
  histUnit: { color: COLORS.muted, fontSize: 12, fontFamily: FONT.mono },
  histLabel: { color: COLORS.muted, fontSize: 10, marginTop: 3 },
  histDivider: { width: 1, alignSelf: 'stretch', backgroundColor: COLORS.border },

  totalNote: { color: COLORS.muted, fontSize: 12, textAlign: 'center', marginTop: 18, fontFamily: FONT.mono },
});
