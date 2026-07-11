import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Circle, G, Polyline, Text as SvgText } from 'react-native-svg';

import { COLORS } from '../../constants/colors';
import { FONT } from '../../constants/fonts';
import { rarityColor } from '../../constants/landmarks';
import { landmarkDisplayName } from '../../constants/landmarks';
import { markRecapSeen, type RecapData, type RecapPoint } from '../../services/recap';
import { useRecapStore } from '../../store/recapStore';
import ConfettiField from '../discovery/ConfettiField';

/**
 * 탐험 일지 — 별자리 리캡 풀스크린 연출.
 * 걸은 경로(신규 타일 시간순)가 밤하늘 별자리처럼 점→선으로 점등되고,
 * 발견 랜드마크가 등급색 별로 팡. 완료 시 콘페티 + 숫자 카운트업 요약 →
 * [보상 받기]로 닫으면 뒤에 대기하던 발견/뱃지 카드 스택이 드러난다.
 * 전부 화면 층(배터리 헌장 무관), JS-only.
 */

const REVEAL_TICK_MS = 45; // 점 하나 점등 간격 (~80점 × 45ms ≈ 3.6s)

function fmtDate(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

/** 위경도 → 화면 좌표 투영 (bbox fit + 위도보정 등비 스케일, 북쪽 위). */
function useProjection(points: RecapPoint[], w: number, h: number) {
  return useMemo(() => {
    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const midLat = (minLat + maxLat) / 2;
    const cos = Math.max(0.2, Math.cos((midLat * Math.PI) / 180));
    const dLat = Math.max(maxLat - minLat, 1e-4);
    const dLng = Math.max((maxLng - minLng) * cos, 1e-4);
    const pad = 0.12;
    const scale = Math.min((w * (1 - pad * 2)) / dLng, (h * (1 - pad * 2)) / dLat);
    const ox = (w - dLng * scale) / 2;
    const oy = (h - dLat * scale) / 2;
    return (p: { lat: number; lng: number }) => ({
      x: ox + (p.lng - minLng) * cos * scale,
      y: h - (oy + (p.lat - minLat) * scale), // 북쪽이 위
    });
  }, [points, w, h]);
}

/** 배경 잔별 반짝임. */
function Twinkle({ x, y, delay }: { x: number; y: number; delay: number }) {
  const v = useRef(new Animated.Value(0.2)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 0.9, duration: 1400, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0.2, duration: 1400, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [v, delay]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#F4EFE6',
        opacity: v,
      }}
    />
  );
}

/** 숫자 카운트업 (도파민 담당). */
function CountUp({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const steps = 24;
    let i = 0;
    const id = setInterval(() => {
      i++;
      // ease-out: 마지막에 감속하며 착지
      const t = 1 - Math.pow(1 - i / steps, 3);
      setVal(to * t);
      if (i >= steps) clearInterval(id);
    }, 35);
    return () => clearInterval(id);
  }, [to]);
  return <Text style={styles.statNum}>{val.toFixed(decimals)}</Text>;
}

export default function RecapOverlay() {
  const playing = useRecapStore((s) => s.playing);
  const data = useRecapStore((s) => s.data);
  if (!playing || !data) return null;
  return <RecapShow data={data} />;
}

function RecapShow({ data }: { data: RecapData }) {
  const { width: W, height: H } = useWindowDimensions();
  const close = useRecapStore((s) => s.close);
  const skyH = H * 0.52;
  const project = useProjection(data.points, W, skyH);

  const [visible, setVisible] = useState(1); // 점등된 점 수
  const [phase, setPhase] = useState<'draw' | 'stats'>('draw');
  const done = visible >= data.points.length;

  // 별자리 점등 타이머
  useEffect(() => {
    if (phase !== 'draw') return;
    if (done) {
      const t = setTimeout(() => setPhase('stats'), 550); // 완성 감상 한 박자
      return () => clearTimeout(t);
    }
    const id = setInterval(() => setVisible((v) => v + 1), REVEAL_TICK_MS);
    return () => clearInterval(id);
  }, [phase, done]);

  // 요약 카드 슬라이드업
  const statsIn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (phase === 'stats') {
      Animated.spring(statsIn, { toValue: 1, friction: 8, tension: 60, useNativeDriver: true }).start();
    }
  }, [phase, statsIn]);

  // 배경 잔별 배치(1회)
  const twinkles = useRef(
    Array.from({ length: 14 }, () => ({
      x: Math.random() * W,
      y: Math.random() * skyH,
      delay: Math.random() * 2000,
    }))
  ).current;

  const shown = data.points.slice(0, visible);
  const currentTs = shown[shown.length - 1]?.ts ?? 0;
  const polyPoints = shown.map((p) => {
    const { x, y } = project(p);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const heroLm = data.landmarks[0]; // 최고 등급 발견(자막용)

  const onReceive = () => {
    markRecapSeen(data.until);
    close(true); // 닫히면 뒤에 대기하던 발견/뱃지 카드 스택이 드러남
  };

  return (
    <View style={styles.wrap}>
      {/* 하늘 영역 탭 → 빨리감기 */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => phase === 'draw' && setVisible(data.points.length)}
      />

      {/* 헤더 */}
      <View style={styles.header} pointerEvents="none">
        <Text style={styles.kicker}>✦ EXPLORATION LOG</Text>
        <Text style={styles.title}>
          {data.regionName ? `${data.regionName}의 별자리` : '미지의 별자리'}
        </Text>
        <Text style={styles.dates}>
          {fmtDate(data.since)} — {fmtDate(data.until)}
          {data.regionEn ? ` · ${data.regionEn}` : ''}
        </Text>
      </View>

      {/* 밤하늘 + 별자리 */}
      <View style={[styles.sky, { height: skyH }]} pointerEvents="none">
        {twinkles.map((t, i) => (
          <Twinkle key={i} {...t} />
        ))}
        <Svg width={W} height={skyH}>
          {/* 경로 글로우 + 본선 */}
          {shown.length >= 2 && (
            <>
              <Polyline
                points={polyPoints}
                fill="none"
                stroke={COLORS.lime}
                strokeWidth={5}
                strokeOpacity={0.14}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <Polyline
                points={polyPoints}
                fill="none"
                stroke="#F4EFE6"
                strokeWidth={1.4}
                strokeOpacity={0.6}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </>
          )}
          {/* 별점 */}
          {shown.map((p, i) => {
            const { x, y } = project(p);
            const major = i % 5 === 0;
            return (
              <Circle
                key={i}
                cx={x}
                cy={y}
                r={major ? 2.8 : 1.8}
                fill={major ? COLORS.lime : '#F4EFE6'}
                opacity={major ? 0.95 : 0.85}
              />
            );
          })}
          {/* 발견 랜드마크 = 등급색 별 (타임라인 도달 시 등장) */}
          {data.landmarks
            .filter((lm) => (lm.discoveredAt ?? 0) <= currentTs || phase === 'stats')
            .map((lm) => {
              const { x, y } = project({ lat: lm.lat, lng: lm.lng });
              const c = rarityColor(lm.rarity);
              return (
                <G key={lm.osmId} x={x} y={y}>
                  <Circle r={9} fill={c} opacity={0.22} />
                  <SvgText
                    x={0}
                    y={6}
                    fontSize={16}
                    fill={c}
                    textAnchor="middle"
                  >
                    ✦
                  </SvgText>
                </G>
              );
            })}
        </Svg>
      </View>

      {phase === 'draw' ? (
        <Text style={styles.hint}>탭해서 빨리감기 ⏩</Text>
      ) : (
        <>
          {/* 도파민 파트: 콘페티 + 카운트업 요약 */}
          <ConfettiField count={26} />
          <Animated.View
            style={[
              styles.statsCard,
              {
                opacity: statsIn,
                transform: [
                  { translateY: statsIn.interpolate({ inputRange: [0, 1], outputRange: [80, 0] }) },
                ],
              },
            ]}
          >
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <CountUp to={data.tileCount} />
                <Text style={styles.statLabel}>새로 밝힌 칸</Text>
              </View>
              <View style={styles.stat}>
                <CountUp to={data.km} decimals={1} />
                <Text style={styles.statLabel}>km</Text>
              </View>
              <View style={styles.stat}>
                <CountUp to={data.landmarks.length} />
                <Text style={styles.statLabel}>발견</Text>
              </View>
            </View>

            {heroLm ? (
              <Text style={styles.heroLine} numberOfLines={1}>
                ✦ 하이라이트 — <Text style={{ color: rarityColor(heroLm.rarity) }}>{landmarkDisplayName(heroLm)}</Text>
              </Text>
            ) : null}
            {data.regionPct ? (
              <Text style={styles.pctLine}>
                {data.regionName} 달성률 <Text style={styles.pctNum}>{data.regionPct}</Text> 🔥
              </Text>
            ) : null}

            <TouchableOpacity style={styles.cta} onPress={onReceive} activeOpacity={0.85}>
              <Text style={styles.ctaText}>보상 받기 ✨</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.later} onPress={() => close(false)}>
              <Text style={styles.laterText}>나중에 다시 볼래요</Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#07080E',
    zIndex: 1300, // 발견/뱃지 카드(1100~1200) 위 — 닫으면 카드가 드러나는 순서
    elevation: 1300,
  },
  header: { marginTop: 72, alignItems: 'center', paddingHorizontal: 24 },
  kicker: { fontFamily: FONT.monoMedium, fontSize: 11, letterSpacing: 4, color: COLORS.gold },
  title: {
    fontFamily: FONT.serif,
    fontSize: 30,
    color: '#F7F2E8',
    marginTop: 10,
    textShadowColor: 'rgba(200,245,96,0.35)',
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 2 },
  },
  dates: { fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1.5, color: COLORS.muted, marginTop: 7 },
  sky: { marginTop: 8 },
  hint: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: FONT.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: '#6B7187',
  },
  statsCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 44,
    backgroundColor: '#11131F',
    borderWidth: 1,
    borderColor: 'rgba(139,124,255,0.45)',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', minWidth: 76 },
  statNum: { fontFamily: FONT.display, fontSize: 34, color: COLORS.lime, lineHeight: 38 },
  statLabel: { fontSize: 11, color: COLORS.muted, marginTop: 3 },
  heroLine: { fontSize: 12.5, color: COLORS.text, textAlign: 'center', marginTop: 16 },
  pctLine: { fontSize: 12.5, color: COLORS.muted, textAlign: 'center', marginTop: 7 },
  pctNum: { fontFamily: FONT.display, color: COLORS.gold, fontSize: 14 },
  cta: {
    backgroundColor: COLORS.lime,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 18,
  },
  ctaText: { color: COLORS.fog, fontWeight: '800', fontSize: 15 },
  later: { alignItems: 'center', paddingVertical: 11, marginTop: 2 },
  laterText: { color: COLORS.muted, fontSize: 12.5 },
});
