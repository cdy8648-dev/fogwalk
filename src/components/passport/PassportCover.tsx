import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { FONT } from '../../constants/fonts';
import { codeToFlag } from '../../utils/flag';
import { abbrev } from '../../utils/format';
import { fs } from '../../utils/responsive';

// 디자인 핸드오프 전용 팔레트 (앱 공통 COLORS 와 별개의 여권 무드).
const P = {
  cardTop: '#14172B',
  cardBottom: '#0F1120',
  border: '#232844',
  divider: '#2E3450',
  lime: '#C8F560',
  limeDim: '#9ADF4E',
  teal: '#5BC0BE',
  violet: '#9B8CFF',
  textMain: '#F4EFE6',
  caption: '#8A90A6',
  caption2: '#7C8294',
  dim: '#5B617A',
  dim2: '#4C5268',
};

/** 국가 영문명 (여권 표지용) — 큐레이션 없으면 코드로 폴백. */
const COUNTRY_EN: Record<string, { short: string; full: string }> = {
  KR: { short: 'KOREA', full: 'REPUBLIC OF KOREA' },
  JP: { short: 'JAPAN', full: 'JAPAN' },
  US: { short: 'USA', full: 'UNITED STATES OF AMERICA' },
};

/** MRZ 한 줄: 공백→'<', 40자 '<' 패딩. */
function mrzLine(raw: string, len = 40): string {
  return raw.toUpperCase().replace(/\s+/g, '<').padEnd(len, '<').slice(0, len);
}

interface Props {
  code: string; // ISO2 (KR)
  name: string; // 한글 국가명
  pct: number | null; // 국가 달성률(면적 미상이면 null)
  pctText: string | null; // 표시용 (예: '0.04%')
  totalTiles: number;
  visitedRegions: number;
  totalRegions: number | null; // KR=17, 그 외 null → '남은 지역' 숨김
  passportNo: string; // 'KR-0824'
  regionEns: string[]; // MRZ 용 상위 지역 영문 (최대 2)
}

/**
 * 여권 표지 카드 — 도트 보안패턴 + 상단 그라데이션 엣지 + 달성률 스탬프(찍힘 애니메이션)
 * + 스탯 3종 + MRZ 라인. 국가 상세(디지털 여권) 화면의 히어로.
 */
export default function PassportCover(p: Props) {
  const en = COUNTRY_EN[p.code] ?? { short: p.code, full: p.code };
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  // 스탬프 찍힘: scale 1.6 → 0.94 → 1.0 + 불투명도 0 → 1 (진입 시 1회)
  const stamp = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(stamp, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [stamp]);
  const stampScale = stamp.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1.6, 0.94, 1] });
  const stampOpacity = stamp.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 1] });

  const pctMain = p.pctText ? p.pctText.replace('%', '') : abbrev(p.totalTiles);
  const mrz1 = mrzLine(
    `P<${p.code === 'KR' ? 'KOR' : p.code}<FOGWALK<<EXPLORER<<${p.totalTiles}CELLS`
  );
  const mrz2 = mrzLine(
    `${p.passportNo.replace('-', '')}<<${p.regionEns.slice(0, 2).join('<') || 'NOWHERE<YET'}<<${
      p.pctText ? `${p.pctText.replace('%', '')}PCT` : `${p.visitedRegions}REGIONS`
    }`
  );

  return (
    <View style={styles.shadow}>
      <LinearGradient
        colors={[P.cardTop, P.cardBottom]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.35, y: 1 }}
        style={styles.card}
      >
        {/* 도트 보안 패턴 (14px 그리드 느낌 — dotted 보더 행 반복) */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: 22 }, (_, i) => (
            <View key={i} style={[styles.dotRow, { top: i * 14 + 6 }]} />
          ))}
        </View>
        {/* 상단 그라데이션 엣지 */}
        <LinearGradient
          colors={[P.lime, P.teal, P.violet]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.edge}
        />

        <View style={styles.headerRow}>
          <Text style={styles.brand}>FOGWALK PASSPORT</Text>
          <Text style={styles.passNo}>NO. {p.passportNo}</Text>
        </View>

        <View style={styles.countryRow}>
          <Text style={styles.flag}>{codeToFlag(p.code)}</Text>
          <View>
            <Text style={styles.countryName}>{p.name}</Text>
            <Text style={styles.countryEn}>{en.full}</Text>
          </View>
        </View>

        {/* 달성률 스탬프 (우상단, 국가명과 살짝 겹침) */}
        <Animated.View
          style={[
            styles.stampBox,
            { opacity: stampOpacity, transform: [{ rotate: '-12deg' }, { scale: stampScale }] },
          ]}
          pointerEvents="none"
        >
          <View style={styles.stampRingOuter} />
          <View style={styles.stampRingInner} />
          <View style={styles.stampRingDashed} />
          <View style={styles.stampCenter}>
            <Text style={styles.stampLabel}>{en.short} · EXPLORED</Text>
            <Text style={styles.stampPct}>
              {pctMain}
              <Text style={styles.stampPctUnit}>{p.pctText ? '%' : '칸'}</Text>
            </Text>
            <Text style={styles.stampDate}>{dateStr}</Text>
          </View>
        </Animated.View>

        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statValue}>{p.totalTiles.toLocaleString()}</Text>
            <Text style={styles.statLabel}>밝힌 칸</Text>
          </View>
          <View>
            <Text style={styles.statValue}>{p.visitedRegions}</Text>
            <Text style={styles.statLabel}>방문 지역</Text>
          </View>
          {p.totalRegions != null && (
            <View>
              <Text style={[styles.statValue, { color: P.violet }]}>
                {Math.max(0, p.totalRegions - p.visitedRegions)}
              </Text>
              <Text style={styles.statLabel}>남은 지역</Text>
            </View>
          )}
        </View>

        <View style={styles.mrz}>
          <Text style={styles.mrzText} numberOfLines={1}>
            {mrz1}
          </Text>
          <Text style={styles.mrzText} numberOfLines={1}>
            {mrz2}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: P.border,
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 18,
    overflow: 'hidden',
  },
  dotRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    borderTopWidth: 2,
    borderStyle: 'dotted',
    borderColor: 'rgba(155,140,255,0.08)',
  },
  edge: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { fontFamily: FONT.mono, fontSize: fs(10), letterSpacing: 2.8, color: P.caption },
  passNo: { fontFamily: FONT.mono, fontSize: fs(10), color: P.dim },
  countryRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
  flag: { fontSize: fs(34) },
  countryName: { fontFamily: FONT.serif, fontSize: fs(25), color: P.textMain },
  countryEn: {
    fontFamily: FONT.mono,
    fontSize: fs(11),
    letterSpacing: 0.88,
    color: P.caption,
    marginTop: 2,
  },
  // 112×112 원형 스탬프 — double 보더는 링 2겹으로 재현
  stampBox: { position: 'absolute', top: 52, right: 2, width: 112, height: 112 },
  stampRingOuter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 56,
    borderWidth: 1.2,
    borderColor: P.lime,
    opacity: 0.9,
  },
  stampRingInner: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: 3,
    bottom: 3,
    borderRadius: 53,
    borderWidth: 1.2,
    borderColor: P.lime,
    opacity: 0.9,
  },
  stampRingDashed: {
    position: 'absolute',
    top: 9,
    left: 9,
    right: 9,
    bottom: 9,
    borderRadius: 47,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(200,245,96,0.65)',
  },
  stampCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampLabel: { fontFamily: FONT.mono, fontSize: fs(7.5), letterSpacing: 1.35, color: P.limeDim },
  stampPct: { fontFamily: FONT.display, fontSize: fs(26), color: P.lime, lineHeight: 28, marginTop: 3 },
  stampPctUnit: { fontSize: fs(13) },
  stampDate: { fontFamily: FONT.mono, fontSize: fs(7.5), letterSpacing: 1.05, color: P.limeDim, marginTop: 3 },
  statsRow: { flexDirection: 'row', gap: 18, marginTop: 20 },
  statValue: { fontFamily: FONT.display, fontSize: fs(21), color: P.textMain },
  statLabel: { fontSize: fs(10), color: P.caption2, marginTop: 1 },
  mrz: {
    marginTop: 16,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: P.divider,
    paddingTop: 10,
  },
  mrzText: {
    fontFamily: FONT.mono,
    fontSize: fs(9.5),
    letterSpacing: 1.14,
    color: P.dim2,
    lineHeight: 16,
  },
});
