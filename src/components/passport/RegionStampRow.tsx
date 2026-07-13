import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { FONT } from '../../constants/fonts';
import { abbrev } from '../../utils/format';
import { fs } from '../../utils/responsive';

const P = {
  cardBg: '#11131F',
  border: '#232844',
  borderTop: 'rgba(200,245,96,0.4)',
  track: '#181C2E',
  lime: '#C8F560',
  teal: '#5BC0BE',
  violet: '#9B8CFF',
  textMain: '#F4EFE6',
  caption: '#8A90A6',
  caption2: '#7C8294',
  subNum: '#C5CAD9',
};

export interface RegionRowData {
  name: string; // 서울 (H3 팩 정규화 키)
  en: string | null; // SEOUL (한국 외 null)
  pct: number | null; // 달성률 (KR=팩 타일 기준, 미상 null)
  pctText: string | null; // '0.04%'
  tiles: number;
  remainingTiles: number | null; // pct≥80 코멘트용
  subs: { region: string; tiles: number; pctText: string | null }[]; // 시/군/구, 칸수 내림차순
}

interface Props {
  data: RegionRowData;
  top: boolean; // 최고 진행률 지역 → 라임 강조
  rotate: number; // 미니 스탬프 기울기(도)
  barRatio: number; // 진행바 채움 0~1 (화면에서 계산)
  expanded: boolean;
  onToggle: () => void;
}

/**
 * 지역 비자 스탬프 행 — 미니 스탬프(달성률) + 지역명/칸수 + 진행바 +
 * 코멘트(정복 임박) 또는 하위 시 요약. 탭하면 하위 시 전체가 아코디언으로 펼쳐진다.
 */
export default function RegionStampRow({ data, top, rotate, barRatio, expanded, onToggle }: Props) {
  // 스탬프 색: 달성률 80%↑ 라임, 그 외 바이올렛 (핸드오프 규칙)
  const stampColor = data.pct != null && data.pct >= 80 ? P.lime : P.violet;
  const barColors: [string, string] = top ? [P.lime, P.teal] : [P.violet, P.teal];

  // 진행바 0 → 목표값 채움 (0.6s ease-out, 진입 시 1회)
  const bar = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(bar, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // width 애니메이션은 레이아웃 — 네이티브 드라이버 불가
    }).start();
  }, [bar]);
  const barWidth = bar.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${Math.min(Math.max(barRatio * 100, 0), 100)}%`],
  });

  const almostDone = data.pct != null && data.pct >= 80;
  const subSummary = data.subs.slice(0, 2);

  return (
    <TouchableOpacity
      style={[styles.card, top && styles.cardTop]}
      activeOpacity={0.85}
      onPress={onToggle}
      accessibilityLabel={`${data.name} ${abbrev(data.tiles)}칸 ${expanded ? '접기' : '펼치기'}`}
    >
      <View style={styles.mainRow}>
        {/* 좌측 미니 스탬프 (52×52, double 보더 = 링 2겹) */}
        <View style={[styles.stamp, { transform: [{ rotate: `${rotate}deg` }] }]}>
          <View style={[styles.stampRing, { borderColor: stampColor }]} />
          <View style={[styles.stampRingIn, { borderColor: stampColor }]} />
          <Text
            style={[styles.stampPct, { color: stampColor }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {data.pctText ?? abbrev(data.tiles)}
          </Text>
          {data.en && (
            <Text style={[styles.stampEn, { color: stampColor }]} numberOfLines={1}>
              {data.en}
            </Text>
          )}
        </View>

        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {data.name}
            </Text>
            <Text style={[styles.tiles, { color: stampColor }]}>{abbrev(data.tiles)}칸</Text>
          </View>

          <View style={styles.track}>
            <Animated.View style={[styles.fillClip, { width: barWidth }]}>
              <LinearGradient
                colors={barColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.fill}
              />
            </Animated.View>
          </View>

          {almostDone && data.remainingTiles != null ? (
            <Text style={styles.comment}>
              거의 정복! {abbrev(data.remainingTiles)}칸 남음
            </Text>
          ) : subSummary.length > 0 ? (
            <View style={styles.subSummaryRow}>
              {subSummary.map((s) => (
                <Text key={s.region} style={styles.subSummary} numberOfLines={1}>
                  {s.region}{' '}
                  <Text style={styles.subSummaryNum}>{s.pctText ?? abbrev(s.tiles)}</Text>
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.comment}>세부 기록이 곧 쌓여요</Text>
          )}
        </View>
      </View>

      {/* 아코디언: 하위 시/구 전체 */}
      {expanded && data.subs.length > 0 && (
        <View style={styles.subList}>
          {data.subs.map((s) => (
            <View key={s.region} style={styles.subRow}>
              <Text style={styles.subName} numberOfLines={1}>
                {s.region}
              </Text>
              <Text style={styles.subNum}>
                {s.pctText ? `${s.pctText} · ` : ''}
                {abbrev(s.tiles)}칸
              </Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: P.cardBg,
    borderWidth: 1,
    borderColor: P.border,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 15,
  },
  cardTop: { borderColor: P.borderTop }, // 최고 진행률 지역 강조
  mainRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  stamp: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    borderWidth: 1,
  },
  stampRingIn: {
    position: 'absolute',
    top: 2.5,
    left: 2.5,
    right: 2.5,
    bottom: 2.5,
    borderRadius: 10,
    borderWidth: 1,
  },
  stampPct: { fontFamily: FONT.display, fontSize: fs(15), lineHeight: 16, maxWidth: 44 },
  stampEn: { fontFamily: FONT.mono, fontSize: fs(6.5), letterSpacing: 0.65, marginTop: 2 },
  body: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  name: { fontSize: fs(14.5), fontWeight: '800', color: P.textMain, flexShrink: 1, marginRight: 8 },
  tiles: { fontFamily: FONT.display, fontSize: fs(13) },
  track: {
    height: 7,
    backgroundColor: P.track,
    borderRadius: 999,
    marginTop: 8,
    overflow: 'hidden',
  },
  fillClip: { height: '100%', borderRadius: 999, overflow: 'hidden' },
  fill: { flex: 1 },
  comment: { fontSize: fs(10), color: P.caption2, marginTop: 5 },
  subSummaryRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  subSummary: { fontSize: fs(10), color: P.caption },
  subSummaryNum: { color: P.subNum, fontWeight: '700' },
  subList: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: P.border,
    gap: 8,
  },
  subRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subName: { color: P.caption, fontSize: fs(12.5), flex: 1, marginRight: 8 },
  subNum: { color: P.subNum, fontSize: fs(12.5), fontFamily: FONT.mono },
});
