import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import SectionPill from '../components/ui/SectionPill';
import { ACHIEVEMENTS, type AchievementDef } from '../constants/achievements';
import { COLORS } from '../constants/colors';
import { FONT } from '../constants/fonts';
import { getAllAchievements, getTileCount } from '../services/db';
import { useAchievementStore } from '../store/achievementStore';
import { useUserStore } from '../store/userStore';
import { formatDate } from '../utils/date';

function metricValue(metric: AchievementDef['metric'], km: number, streak: number, tiles: number) {
  if (metric === 'streak') return streak;
  if (metric === 'distanceKm') return km;
  return tiles;
}

export default function BadgeDetailScreen() {
  const unlockedTypes = useAchievementStore((s) => s.unlockedTypes);
  const km = useUserStore((s) => s.totalDistanceM) / 1000;
  const streak = useUserStore((s) => s.streak);

  // 해금 일자 (있으면 카드에 표기).
  const unlockedAt = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of getAllAchievements()) map[a.type] = a.unlockedAt;
    return map;
  }, [unlockedTypes]);
  const tiles = useMemo(() => getTileCount(), [unlockedTypes]);

  const unlockedCount = ACHIEVEMENTS.filter((a) => unlockedTypes.has(a.type)).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionPill label="뱃지 도감" color={COLORS.lime} rotate={-1.5} hint={`${unlockedCount}/${ACHIEVEMENTS.length} 해금`} />

      <View style={styles.grid}>
        {ACHIEVEMENTS.map((a) => {
          const unlocked = unlockedTypes.has(a.type);
          const cur = metricValue(a.metric, km, streak, tiles);
          const prog = Math.min(1, cur / a.threshold);
          return (
            <View key={a.type} style={[styles.card, unlocked ? styles.cardOn : styles.cardOff]}>
              <Text style={[styles.emoji, !unlocked && styles.dim]}>
                {unlocked ? a.emoji : '🔒'}
              </Text>
              <Text style={styles.label} numberOfLines={2}>
                {a.label}
              </Text>
              {unlocked ? (
                <Text style={styles.date}>{formatDate(unlockedAt[a.type]) || '획득'}</Text>
              ) : (
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${prog * 100}%` }]} />
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.fog },
  content: { padding: 16, paddingBottom: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  card: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  cardOn: { borderWidth: 2, borderColor: COLORS.lime },
  cardOff: { borderWidth: 1, borderColor: COLORS.border, opacity: 0.7 },
  emoji: { fontSize: 36 },
  dim: { opacity: 0.7 },
  label: { color: COLORS.text, fontSize: 13, fontWeight: '700', marginTop: 8, textAlign: 'center' },
  date: { color: COLORS.lime, fontSize: 11, marginTop: 6, fontFamily: FONT.mono },
  track: {
    height: 6,
    width: '70%',
    backgroundColor: COLORS.fogLight,
    borderRadius: 999,
    marginTop: 9,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: COLORS.muted, borderRadius: 999 },
});
