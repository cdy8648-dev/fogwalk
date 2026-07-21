import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { COLORS } from '../constants/colors';
import { FONT } from '../constants/fonts';
import { TILE_GRADES, tierState, type TileNodeState } from '../constants/milestones';
import { useMapStore } from '../store/mapStore';
import { abbrev } from '../utils/format';

// 시안 2a 스펙 전용 색(공용 COLORS 에 없는 톤).
const TINT = {
  cardBg: '#151827',
  cardBorder: '#232844',
  track: '#232844',
  title: '#F4EFE6',
  innerDark: '#0D0F1A',
  lockBg: '#1A1E30',
  lockBorder: '#2E3450',
  pipOff: '#2E3450',
  pipDim: '#5B617A',
} as const;

// 레벨 링 게이지 (진행률 = 등급 내 달성 노드/4).
const RING = 52;
const RING_STROKE = 4;
const RING_R = (RING - RING_STROKE) / 2; // 24
const RING_C = 2 * Math.PI * RING_R;

// 노드 트랙 레이아웃.
const NODE_COL = 56; // 노드 한 칸 폭(원 중심 정렬용)
const CIRCLE_AREA = 56; // 원 영역 높이(맥동 링 여유 포함)
const TRACK_INSET = NODE_COL / 2; // 트랙 라인 좌우 인셋 = 노드 반폭

/**
 * Collection 뱃지 섹션 — 등급 승급 인터페이스(시안 2a: 트랙 + 티어 헤더).
 * 밝힌 칸 수로 tierState() 를 읽어 현재 등급/노드 상태를 렌더한다.
 * @param onTierUp 마지막 노드 달성으로 등급이 오르는 순간(트리거 시점만 — 오버레이는 Out of Scope).
 */
export default function TierProgressCard({ onTierUp }: { onTierUp?: (grade: number) => void }) {
  const tiles = useMapStore((s) => s.visitedTileIds.size);
  const t = tierState(tiles);

  // 승급 트리거 시점 연동: 세션 중 등급이 오르면 콜백(오버레이 구현은 별도/Out of Scope).
  const prevGrade = useRef(t.grade);
  useEffect(() => {
    if (t.grade > prevGrade.current) onTierUp?.(t.grade);
    prevGrade.current = t.grade;
  }, [t.grade, onTierUp]);

  const ringFrac = t.doneCount / t.nodes.length;

  // 트랙 라임 채움: 마지막 달성 노드까지 + 현재 진행분.
  const trackFrac =
    t.doneCount >= t.nodes.length ? 1 : t.doneCount === 0 ? 0 : (t.doneCount - 1 + t.ratio) / 3;

  const barFrac = t.maxed ? 1 : t.ratio;
  const lastNode = t.gradeDef.nodes[t.gradeDef.nodes.length - 1];

  return (
    <View style={styles.card}>
      {/* 1. 티어 헤더 */}
      <View style={styles.header}>
        <RingGauge frac={ringFrac} grade={t.grade} />
        <View style={styles.nameBlock}>
          <Text style={styles.gradeName} numberOfLines={1}>
            {t.gradeDef.name}
          </Text>
          <Text style={styles.scale} numberOfLines={1}>
            {t.gradeDef.scaleLabel} <Text style={styles.area}>{t.gradeDef.area}</Text>
          </Text>
        </View>
        <View style={styles.pips}>
          <View style={styles.pipRow}>
            {TILE_GRADES.map((g) => {
              const done = t.maxed || g.grade < t.grade;
              const current = !t.maxed && g.grade === t.grade;
              return (
                <View
                  key={g.grade}
                  style={[
                    styles.pip,
                    done && styles.pipDone,
                    current && styles.pipCurrent,
                    !done && !current && styles.pipMiss,
                  ]}
                />
              );
            })}
          </View>
          <Text style={styles.pipCount}>{t.grade} / 10</Text>
        </View>
      </View>

      {/* 2. 4노드 트랙 */}
      <View style={styles.trackWrap}>
        <View style={styles.trackBg}>
          <View style={[styles.trackFill, { width: `${trackFrac * 100}%` }]} />
        </View>
        <View style={styles.nodesRow}>
          {t.nodes.map((n) => (
            <NodeView key={n.tiles} node={n} />
          ))}
        </View>
      </View>

      {/* 3. 진행 인셋 */}
      <View style={styles.inset}>
        <View style={styles.insetTop}>
          <Text style={styles.insetLabel}>{t.maxed ? '최고 등급 달성' : '다음 노드까지'}</Text>
          {!t.maxed && t.currentNode != null && (
            <Text style={styles.insetVal}>
              <Text style={styles.insetCur}>{abbrev(tiles)}</Text>
              <Text style={styles.insetTarget}> / {abbrev(t.currentNode)}</Text> 칸
            </Text>
          )}
        </View>
        <ProgressBar frac={barFrac} />
      </View>

      {/* 4. 승급 힌트 */}
      <View style={styles.hint}>
        <Text style={styles.hintEmoji}>🏔️</Text>
        {t.nextGrade ? (
          <Text style={styles.hintText}>
            {abbrev(lastNode)} 달성 시{' '}
            <Text style={styles.hintGrade}>
              LV.{t.nextGrade.grade} {t.nextGrade.name}
            </Text>{' '}
            승급
          </Text>
        ) : (
          <Text style={styles.hintText}>
            최고 등급 <Text style={styles.hintGrade}>{t.gradeDef.name}</Text> 달성
          </Text>
        )}
      </View>
    </View>
  );
}

// ── 레벨 링 (react-native-svg 원호) ─────────────────────────────
function RingGauge({ frac, grade }: { frac: number; grade: number }) {
  const cx = RING / 2;
  const offset = RING_C * (1 - Math.min(1, Math.max(0, frac)));
  return (
    <View style={styles.ring}>
      <Svg width={RING} height={RING}>
        {/* 안쪽 어두운 원 + 미달 트랙 링 */}
        <Circle cx={cx} cy={cx} r={RING_R} fill={TINT.innerDark} stroke={TINT.track} strokeWidth={RING_STROKE} />
        {/* 진행 원호(위쪽 12시부터 시계방향) */}
        {frac > 0 && (
          <Circle
            cx={cx}
            cy={cx}
            r={RING_R}
            fill="none"
            stroke={COLORS.lime}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_C}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cx})`}
          />
        )}
      </Svg>
      <View style={styles.ringCenter} pointerEvents="none">
        <Text style={styles.ringLv}>LV</Text>
        <Text style={styles.ringNum}>{grade}</Text>
      </View>
    </View>
  );
}

// ── 4노드 한 칸 ────────────────────────────────────────────────
function NodeView({ node }: { node: TileNodeState }) {
  const { status, label } = node;
  return (
    <View style={styles.node}>
      <View style={styles.circleArea}>
        {status === 'current' && <PulseRing />}
        <View
          style={[
            styles.circle,
            status === 'done' && styles.circleDone,
            status === 'current' && styles.circleCurrent,
            status === 'locked' && styles.circleLocked,
          ]}
        >
          {status === 'done' && <View style={styles.sheen} pointerEvents="none" />}
          <Text style={status === 'done' ? styles.check : styles.nodeEmoji}>
            {status === 'done' ? '✓' : status === 'current' ? '🎯' : '🔒'}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.nodeLabel,
          status === 'done' && styles.labelDone,
          status === 'current' && styles.labelCurrent,
          status === 'locked' && styles.labelLocked,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

// 현재 노드 맥동 링 (reanimated 미설치 → RN Animated).
function PulseRing() {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(v, { toValue: 1, duration: 2200, easing: Easing.out(Easing.ease), useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] });
  const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  return <Animated.View style={[styles.pulse, { opacity, transform: [{ scale }] }]} pointerEvents="none" />;
}

// 진행 바 등장(0→목표) 애니메이션.
function ProgressBar({ frac }: { frac: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.timing(v, {
      toValue: Math.min(1, Math.max(0, frac)),
      duration: 1100,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [v, frac]);
  const width = v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={styles.barTrack}>
      <Animated.View style={[styles.barFill, { width }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: TINT.cardBg,
    borderWidth: 1,
    borderColor: TINT.cardBorder,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
  },

  // 1. 헤더
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ring: { width: RING, height: RING },
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLv: { fontFamily: FONT.mono, fontSize: 8, letterSpacing: 0.8, color: COLORS.muted, lineHeight: 10 },
  ringNum: { fontFamily: FONT.display, fontSize: 22, color: COLORS.lime, lineHeight: 24 },
  nameBlock: { flex: 1, minWidth: 0 },
  gradeName: { fontSize: 17, fontWeight: '800', color: TINT.title },
  scale: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  area: { fontFamily: FONT.display, color: COLORS.violet },
  pips: { alignItems: 'flex-end', gap: 6 },
  pipRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  pip: { width: 7, height: 7, borderRadius: 4 },
  pipDone: { backgroundColor: COLORS.lime },
  pipCurrent: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.lime,
    shadowColor: COLORS.lime,
    shadowOpacity: 0.9,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  pipMiss: { backgroundColor: TINT.pipOff },
  pipCount: { fontFamily: FONT.mono, fontSize: 9, color: TINT.pipDim },

  // 2. 트랙
  trackWrap: { marginTop: 24, position: 'relative' },
  trackBg: {
    position: 'absolute',
    left: TRACK_INSET,
    right: TRACK_INSET,
    top: CIRCLE_AREA / 2 - 2,
    height: 4,
    borderRadius: 2,
    backgroundColor: TINT.track,
    overflow: 'hidden',
  },
  trackFill: { height: 4, borderRadius: 2, backgroundColor: COLORS.lime },
  nodesRow: { flexDirection: 'row', justifyContent: 'space-between' },
  node: { width: NODE_COL, alignItems: 'center' },
  circleArea: { width: NODE_COL, height: CIRCLE_AREA, alignItems: 'center', justifyContent: 'center' },
  circle: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  circleDone: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.lime,
    shadowColor: COLORS.lime,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  circleCurrent: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: TINT.innerDark,
    borderWidth: 3,
    borderColor: COLORS.lime,
  },
  circleLocked: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: TINT.lockBg,
    borderWidth: 1,
    borderColor: TINT.lockBorder,
    opacity: 0.55,
  },
  sheen: {
    position: 'absolute',
    top: 6,
    left: 9,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  check: { fontSize: 20, fontWeight: '800', color: TINT.innerDark },
  nodeEmoji: { fontSize: 20 },
  pulse: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: COLORS.lime,
  },
  nodeLabel: { fontFamily: FONT.display, fontSize: 13, marginTop: 8, textAlign: 'center' },
  labelDone: { color: COLORS.lime },
  labelCurrent: { color: TINT.title },
  labelLocked: { color: TINT.pipDim },

  // 3. 진행 인셋
  inset: { marginTop: 22, backgroundColor: TINT.innerDark, borderRadius: 16, paddingVertical: 13, paddingHorizontal: 15 },
  insetTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  insetLabel: { fontSize: 13, color: COLORS.muted },
  insetVal: { fontSize: 14, color: TINT.title },
  insetCur: { fontFamily: FONT.display, color: COLORS.lime },
  insetTarget: { fontFamily: FONT.display, color: COLORS.muted },
  barTrack: { marginTop: 10, height: 8, borderRadius: 4, backgroundColor: TINT.track, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: COLORS.lime },

  // 4. 승급 힌트
  hint: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 13, paddingHorizontal: 3 },
  hintEmoji: { fontSize: 13 },
  hintText: { flex: 1, fontSize: 12, color: COLORS.muted },
  hintGrade: { color: COLORS.violet, fontWeight: '700' },
});
