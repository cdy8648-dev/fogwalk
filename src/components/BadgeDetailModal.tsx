import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import BadgeIcon from './BadgeIcon';
import { TIER_COLOR, type BadgeDef, type BadgeTier } from '../constants/badges';
import { COLORS } from '../constants/colors';
import { FONT } from '../constants/fonts';
import { POPUP, POPUP_COLORS } from '../constants/popup';
import { badgeCurrentValue, type BadgeMetrics } from '../services/badges';
import { abbrev } from '../utils/format';

const TIER_LABEL: Record<BadgeTier, string> = { gold: '골드', silver: '실버', bronze: '브론즈' };

interface Props {
  def: BadgeDef;
  metrics: BadgeMetrics;
  unlocked: boolean;
  onClose: () => void;
}

/** 뱃지 상세 — 달성 조건·진행도·보상을 보여주는 중(md) 팝업. 딤 배경 위 solid 카드. */
export default function BadgeDetailModal({ def, metrics, unlocked, onClose }: Props) {
  const accent = TIER_COLOR[def.tier];
  const cur = badgeCurrentValue(def.metric, metrics);
  const ratio = Math.min(1, cur / def.threshold);
  const curCapped = Math.min(cur, def.threshold);
  const curText = def.unit === 'km' ? curCapped.toFixed(1) : abbrev(Math.floor(curCapped));

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.iconWrap}>
            <BadgeIcon icon={def.icon} size={92} locked={!unlocked} />
          </View>

          <View style={styles.gradeRow}>
            <View style={[styles.dot, { backgroundColor: accent }]} />
            <Text style={[styles.grade, { color: accent }]}>뱃지 · {TIER_LABEL[def.tier]}</Text>
          </View>
          <Text style={styles.name}>{unlocked ? def.name : def.hidden ? '???' : def.name}</Text>

          {/* 달성 조건 */}
          <View style={styles.box}>
            <Text style={styles.boxLabel}>달성 조건</Text>
            <Text style={styles.boxText}>{def.hidden && !unlocked ? '숨겨진 뱃지예요' : def.condition}</Text>
          </View>

          {/* 진행도 or 획득 완료 */}
          {unlocked ? (
            <Text style={[styles.done, { color: accent }]}>✓ 획득 완료</Text>
          ) : def.hidden ? null : (
            <View style={styles.progressWrap}>
              <View style={styles.progressTop}>
                <Text style={styles.progressLabel}>진행도</Text>
                <Text style={styles.progressVal}>
                  {curText} / {abbrev(def.threshold)}
                  {def.unit}
                </Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
              </View>
            </View>
          )}

          {/* 보상 문구 + XP */}
          <Text style={styles.cheer}>{def.celebrationText}</Text>
          {def.xpReward > 0 ? (
            <Text style={styles.xp}>보상 +{def.xpReward} XP</Text>
          ) : null}

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>닫기</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7,8,14,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: POPUP.md.maxWidth,
    backgroundColor: POPUP_COLORS.cardSolid,
    borderWidth: 1,
    borderColor: POPUP_COLORS.border,
    borderRadius: POPUP.md.radius,
    padding: POPUP.md.padding + 4,
    alignItems: 'center',
  },
  iconWrap: { marginTop: 4, marginBottom: 10 },
  gradeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  grade: { fontFamily: FONT.monoMedium, fontSize: 11, letterSpacing: 1.5 },
  name: { fontFamily: FONT.serif, fontSize: 22, color: '#F4EFE6', marginTop: 8 },
  box: {
    width: '100%',
    backgroundColor: COLORS.fogLight,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginTop: 16,
  },
  boxLabel: { fontSize: 11, color: COLORS.muted },
  boxText: { fontSize: 14, color: COLORS.text, fontWeight: '600', marginTop: 4 },
  done: { fontSize: 14, fontWeight: '800', marginTop: 14 },
  progressWrap: { width: '100%', marginTop: 14 },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  progressLabel: { fontSize: 11, color: COLORS.muted },
  progressVal: { fontFamily: FONT.display, fontSize: 13, color: COLORS.lime },
  track: {
    height: 7,
    backgroundColor: COLORS.fogLight,
    borderRadius: 999,
    marginTop: 8,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: COLORS.limeDeep, borderRadius: 999 },
  cheer: { fontSize: 13, color: COLORS.violetSoft, marginTop: 16, textAlign: 'center', lineHeight: 19 },
  xp: { fontFamily: FONT.display, fontSize: 15, color: COLORS.lime, marginTop: 8 },
  closeBtn: {
    marginTop: 18,
    alignSelf: 'stretch',
    backgroundColor: COLORS.fogLight,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  closeText: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
});
