import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import BadgeIcon from '../BadgeIcon';
import { TIER_COLOR, type BadgeDef, type BadgeTier } from '../../constants/badges';
import { COLORS } from '../../constants/colors';
import { FONT } from '../../constants/fonts';

/**
 * 뱃지 획득 카드 — 발견 카드(03)와 같은 스택에서 스와이프되는 보상 카드.
 * 티어 그라디언트 헤더 + SVG 뱃지 + 축하 문구 + XP. 버튼 없음(X/스와이프로 넘김).
 */

const TIER_GRADIENT: Record<BadgeTier, [string, string, string, string]> = {
  gold: ['#241B3A', '#3B2A4E', '#7A5560', '#E0A458'],
  silver: ['#1E2230', '#2E3450', '#6E7891', '#B9C0D0'],
  bronze: ['#241A12', '#3E2B1C', '#7A5A3A', '#C98D5A'],
};

const TIER_LABEL: Record<BadgeTier, string> = {
  gold: '골드',
  silver: '실버',
  bronze: '브론즈',
};

function formatToday(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}.${mm}.${dd}`;
}

export default function BadgeRewardCard({ def }: { def: BadgeDef }) {
  const accent = TIER_COLOR[def.tier];

  return (
    <View style={styles.card}>
      <LinearGradient colors={TIER_GRADIENT[def.tier]} style={styles.header}>
        <Text style={styles.headerLabel}>BADGE UNLOCKED</Text>
        <View style={[styles.iconGlow, { backgroundColor: accent }]} />
        <BadgeIcon icon={def.icon} size={96} />
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.gradeRow}>
          <View style={[styles.gradeDot, { backgroundColor: accent }]} />
          <Text style={[styles.gradeLabel, { color: accent }]}>
            뱃지 · {TIER_LABEL[def.tier]}
          </Text>
        </View>
        <Text style={styles.name}>{def.name}</Text>
        <Text style={styles.condition}>
          {def.condition} · {formatToday()} 획득
        </Text>
        <Text style={styles.cheer}>{def.celebrationText}</Text>

        {def.xpReward > 0 ? (
          <View style={styles.xpRow}>
            <Text style={styles.xpValue}>
              +{def.xpReward}
              <Text style={styles.xpUnit}> XP</Text>
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#11131F',
    borderWidth: 1,
    borderColor: '#232844',
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 24 },
  },
  header: { height: 168, alignItems: 'center', justifyContent: 'center' },
  headerLabel: {
    position: 'absolute',
    top: 13,
    left: 15,
    fontFamily: FONT.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: 'rgba(244,239,230,0.72)',
  },
  iconGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.25,
  },
  body: { padding: 20 },
  gradeRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  gradeDot: { width: 8, height: 8, borderRadius: 4 },
  gradeLabel: { fontFamily: FONT.monoMedium, fontSize: 11, letterSpacing: 1.5 },
  name: { fontFamily: FONT.serif, fontSize: 26, color: '#F4EFE6', marginTop: 9 },
  condition: { fontSize: 12, color: '#8A90A6', marginTop: 5 },
  cheer: { fontSize: 13, color: COLORS.violetSoft, marginTop: 10, lineHeight: 19 },
  xpRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 16 },
  xpValue: { fontFamily: FONT.display, fontSize: 34, color: COLORS.lime, lineHeight: 36 },
  xpUnit: { fontSize: 16 },
});
