import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/colors';
import { FONT } from '../constants/fonts';
import { useUserStore } from '../store/userStore';
import Card from './ui/Card';

// 거리 진화 단계 (뱃지 섹션). 실제 totalDistance에 따라 진행.
const STAGES = [
  { km: 1, emoji: '🥾', label: '1km' },
  { km: 5, emoji: '👟', label: '5km' },
  { km: 10, emoji: '🏃', label: '10km' },
  { km: 50, emoji: '🏆', label: '50km' },
];

export default function BadgeStepper() {
  const km = useUserStore((s) => s.totalDistanceM) / 1000;
  let curIdx = STAGES.findIndex((s) => km < s.km);
  if (curIdx === -1) curIdx = STAGES.length - 1;
  const prevKm = curIdx > 0 ? STAGES[curIdx - 1].km : 0;
  const target = STAGES[curIdx].km;
  const prog = Math.min(1, Math.max(0, (km - prevKm) / (target - prevKm)));

  return (
    <Card>
      <View style={styles.row}>
        {STAGES.map((s, i) => {
          const reached = km >= s.km;
          const isCurrent = i === curIdx && !reached;
          const active = reached || isCurrent;
          return (
            <Fragment key={s.km}>
              {i > 0 && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: i <= curIdx ? COLORS.lime : '#23283C' },
                  ]}
                />
              )}
              <View style={styles.node}>
                <View
                  style={[
                    styles.circle,
                    active ? styles.circleActive : styles.circleLocked,
                    isCurrent && styles.circleCurrent,
                  ]}
                >
                  <Text style={styles.emoji}>{s.emoji}</Text>
                </View>
                <Text
                  style={[styles.label, active ? styles.labelActive : styles.labelLocked]}
                >
                  {isCurrent ? `${s.label} · NOW` : s.label}
                </Text>
              </View>
            </Fragment>
          );
        })}
      </View>

      <View style={styles.progressBox}>
        <View style={styles.progressTop}>
          <Text style={styles.progressLabel}>다음 단계까지</Text>
          <Text style={styles.progressVal}>
            {km.toFixed(1)} / {target} km
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${prog * 100}%` }]} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  line: { flex: 1, height: 3, marginTop: 22, borderRadius: 2 },
  node: { width: 56, alignItems: 'center' },
  circle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: { backgroundColor: COLORS.lime },
  circleLocked: {
    backgroundColor: COLORS.lockSurface,
    borderWidth: 1.5,
    borderColor: COLORS.lockBorder,
    opacity: 0.55,
  },
  circleCurrent: {
    shadowColor: COLORS.lime,
    shadowOpacity: 0.55,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 0 },
  },
  emoji: { fontSize: 22 },
  label: { fontSize: 10, marginTop: 5, textAlign: 'center', fontFamily: FONT.mono },
  labelActive: { color: COLORS.lime },
  labelLocked: { color: COLORS.muted },
  progressBox: {
    marginTop: 14,
    backgroundColor: COLORS.inset,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 13,
  },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { color: COLORS.muted, fontSize: 11 },
  progressVal: { color: COLORS.text, fontSize: 12, fontFamily: FONT.display },
  track: {
    height: 7,
    backgroundColor: COLORS.fogLight,
    borderRadius: 999,
    marginTop: 7,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: COLORS.lime, borderRadius: 999 },
});
