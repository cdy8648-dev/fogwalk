import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../constants/colors';
import { FONT } from '../constants/fonts';
import { TILE_MILESTONES, milestoneState } from '../constants/milestones';
import { useMapStore } from '../store/mapStore';
import { abbrev } from '../utils/format';
import Card from './ui/Card';

const VISIBLE = 4; // 한 번에 보여줄 단계 수 (가로 스테퍼)

// 밝힌 칸(타일) 진화 단계 (뱃지 섹션).
export default function BadgeStepper() {
  const tiles = useMapStore((s) => s.visitedTileIds.size);
  const { idx, maxed, target, ratio } = milestoneState(tiles);

  // 현재 단계가 보이도록 4개 윈도우 슬라이스.
  const total = TILE_MILESTONES.length;
  const start = Math.min(Math.max(0, idx - 1), Math.max(0, total - VISIBLE));
  const visible = TILE_MILESTONES.slice(start, start + VISIBLE);

  return (
    <Card>
      <View style={styles.row}>
        {visible.map((m, i) => {
          const globalIdx = start + i;
          const reached = tiles >= m.tiles;
          const isCurrent = globalIdx === idx && !maxed && !reached;
          const active = reached || isCurrent;
          return (
            <Fragment key={m.tiles}>
              {i > 0 && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: globalIdx <= idx ? COLORS.lime : '#23283C' },
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
                  <Text style={styles.emoji}>{m.emoji}</Text>
                </View>
                <Text
                  style={[styles.label, active ? styles.labelActive : styles.labelLocked]}
                >
                  {isCurrent ? `${m.label} · NOW` : m.label}
                </Text>
              </View>
            </Fragment>
          );
        })}
      </View>

      <View style={styles.progressBox}>
        <View style={styles.progressTop}>
          <Text style={styles.progressLabel}>{maxed ? '모든 목표 달성!' : '다음 목표까지'}</Text>
          <Text style={styles.progressVal}>
            {abbrev(tiles)} / {abbrev(target)} 칸
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
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
