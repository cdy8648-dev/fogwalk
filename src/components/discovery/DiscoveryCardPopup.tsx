import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS } from '../../constants/colors';
import { FONT } from '../../constants/fonts';
import { matchCurated } from '../../constants/curatedLandmarks';
import { CATEGORY_ICON } from '../../constants/categoryIcons';
import {
  CATEGORY_LABEL,
  landmarkDisplayName,
  landmarkXp,
  rarityColor,
} from '../../constants/landmarks';
import { CategoryCoin, CategoryGlyph } from '../CategoryIcon';
import { capturePhotoAt } from '../../services/photos';
import { useDiscoveryPopupStore, type PopupPage } from '../../store/discoveryPopupStore';
import BadgeRewardCard from './BadgeRewardCard';
import ConfettiField from './ConfettiField';
import type { Landmark } from '../../types';

/**
 * 03 발견 카드 — 등급 그라디언트 헤더 + 세리프 이름 + XP + '함께 발견' 리스트.
 * live: 액션 버튼(컬렉션 저장/사진/공유). recap: 버튼 없음, 탭/스와이프로 넘김,
 * 카드 2장 이상이면 우상단 페이지 표시(1/2).
 */

const HEADER_GRADIENT: Record<string, [string, string, string, string]> = {
  legendary: ['#241B3A', '#3B2A4E', '#7A5560', '#E0A458'],
  epic: ['#1B1A3A', '#2E2A5E', '#4E4890', '#8B7CFF'],
  rare: ['#122E38', '#1C4A4E', '#357876', '#5BC0BE'],
};

function gradeName(rarity?: string): string {
  if (rarity === 'legendary') return '전설';
  if (rarity === 'epic') return '영웅';
  if (rarity === 'rare') return '희귀';
  return '일반';
}

function formatDate(ts?: number): string {
  const d = ts ? new Date(ts) : new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}.${mm}.${dd}`;
}

// 리스트가 카드를 화면 밖으로 밀지 않도록 표시 상한 (초과분은 XP 합산 요약 행)
const EXTRAS_MAX_ROWS = 6;

/** '함께 발견' — 일반 요소(지하철·일반 POI) 리스트. */
function ExtrasList({ items }: { items: Landmark[] }) {
  if (items.length === 0) return null;
  const shown = items.slice(0, EXTRAS_MAX_ROWS);
  const rest = items.slice(EXTRAS_MAX_ROWS);
  const restXp = rest.reduce((sum, lm) => sum + landmarkXp(lm), 0);
  return (
    <View style={styles.extrasWrap}>
      <Text style={styles.extrasLabel}>함께 발견</Text>
      <View style={styles.extrasBox}>
        {shown.map((lm) => {
          const xp = landmarkXp(lm);
          return (
            <View key={lm.osmId} style={styles.extrasRow}>
              <CategoryGlyph
                icon={CATEGORY_ICON[lm.category] ?? 'detail-pin'}
                size={22}
                ringColor={rarityColor(lm.rarity)}
              />
              <Text style={styles.extrasName} numberOfLines={1}>
                {landmarkDisplayName(lm)}
              </Text>
              <Text style={styles.extrasXp}>{xp > 0 ? `+${xp} XP` : '도감 +1'}</Text>
            </View>
          );
        })}
        {rest.length > 0 ? (
          <View style={styles.extrasRow}>
            <Text style={styles.extrasEmoji}>✨</Text>
            <Text style={styles.extrasName}>외 {rest.length}곳</Text>
            <Text style={styles.extrasXp}>{restXp > 0 ? `+${restXp} XP` : `도감 +${rest.length}`}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/** 희귀 이상 상세 카드. */
function DetailCard({
  lm,
  extras,
  live,
}: {
  lm: Landmark;
  extras: Landmark[];
  live: boolean;
}) {
  const dismiss = useDiscoveryPopupStore((s) => s.dismiss);
  const accent = rarityColor(lm.rarity);
  const xp = landmarkXp(lm);
  const curated = matchCurated(lm.qid, lm.name);
  // 큐레이션에 없는 전설은 정의상 유네스코 태그 자동 승급분
  const unesco = curated ? !!curated.unesco : lm.rarity === 'legendary';
  const gradient = HEADER_GRADIENT[lm.rarity ?? 'rare'] ?? HEADER_GRADIENT.rare;

  const onShare = () => {
    void Share.share({
      message: `FogWalk에서 ${gradeName(lm.rarity)} 랜드마크 "${landmarkDisplayName(lm)}"을(를) 발견했어요! +${xp} XP 🌟`,
    });
  };
  const onPhoto = () => {
    dismiss();
    void capturePhotoAt(lm.lat, lm.lng);
  };

  return (
    <View style={styles.card}>
      {/* 일러스트 헤더 (등급 그라디언트 + 카테고리 코인, 등급색 링은 코인 바깥) */}
      <LinearGradient colors={gradient} style={styles.header}>
        <Text style={styles.headerLabel}>DISCOVERED</Text>
        <View style={[styles.emojiGlow, { backgroundColor: accent }]} />
        <CategoryCoin
          icon={CATEGORY_ICON[lm.category] ?? 'detail-pin'}
          size={92}
          ringColor={accent}
        />
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.gradeRow}>
          <View style={[styles.gradeDot, { backgroundColor: accent }]} />
          <Text style={[styles.gradeLabel, { color: accent }]}>
            {CATEGORY_LABEL[lm.category] ?? '장소'} · {gradeName(lm.rarity)}
          </Text>
          {unesco ? (
            <View style={styles.unescoChip}>
              <Text style={styles.unescoText}>유네스코 세계유산</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.name}>{landmarkDisplayName(lm)}</Text>
        <Text style={styles.date}>{formatDate(lm.discoveredAt)} 발견</Text>
        {curated?.cheer ? <Text style={styles.cheer}>{curated.cheer}</Text> : null}

        <View style={styles.xpRow}>
          <Text style={styles.xpValue}>
            +{xp}
            <Text style={styles.xpUnit}> XP</Text>
          </Text>
        </View>

        <ExtrasList items={extras} />

        {live ? (
          <View style={styles.buttons}>
            <Pressable style={styles.btnPrimary} onPress={dismiss}>
              <Text style={styles.btnPrimaryText}>컬렉션 저장</Text>
            </Pressable>
            <Pressable style={styles.btnOutline} onPress={onPhoto}>
              <Text style={styles.btnOutlineText}>📷 사진</Text>
            </Pressable>
            <Pressable style={styles.btnShare} onPress={onShare}>
              <Text style={styles.btnOutlineText}>↗</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/** 일반 요소만 있을 때의 컴팩트 카드 (헤더 없음). */
function CompactCard({ extras }: { extras: Landmark[] }) {
  return (
    <View style={styles.card}>
      <View style={styles.body}>
        <Text style={styles.headerLabelDark}>DISCOVERED</Text>
        <Text style={styles.compactTitle}>탐험 중 새로운 발견</Text>
        <Text style={styles.date}>{formatDate(extras[0]?.discoveredAt)} 발견</Text>
        <ExtrasList items={extras} />
      </View>
    </View>
  );
}

/** 페이지 종류별 카드 렌더 — 랜드마크(상세/컴팩트) 또는 뱃지 획득. */
function renderPage(page: PopupPage, live: boolean) {
  if (page.kind === 'badge') return <BadgeRewardCard def={page.badge} />;
  return page.main ? (
    <DetailCard lm={page.main} extras={page.extras} live={live} />
  ) : (
    <CompactCard extras={page.extras} />
  );
}

export default function DiscoveryCardPopup() {
  const { width: W } = useWindowDimensions();
  const pages = useDiscoveryPopupStore((s) => s.pages);
  const live = useDiscoveryPopupStore((s) => s.live);
  const dismiss = useDiscoveryPopupStore((s) => s.dismiss);
  const [index, setIndex] = useState(0);

  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 7, tension: 80, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  // 틴더 스와이프 (hanja MainCardSwiper 패턴: 25% 임계 + 회전 + 스프링 복귀).
  // PanResponder는 1회 생성이라 최신 index/개수/폭은 ref로 참조.
  const pan = useRef(new Animated.ValueXY()).current;
  const stateRef = useRef({ index: 0, count: 0, width: 375 });
  stateRef.current = { index, count: pages.length, width: W };

  // 다음 카드로 넘기거나(남은 카드 있으면) 전체 닫기(마지막 카드면). 스와이프·X 버튼 공용.
  const advanceOrClose = () => {
    const { index: i, count } = stateRef.current;
    if (i + 1 >= count) {
      dismiss();
    } else {
      pan.setValue({ x: 0, y: 0 });
      setIndex(i + 1);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      // 가로 드래그일 때만, 카드 2장 이상일 때만 (버튼 탭은 통과)
      onMoveShouldSetPanResponder: (_, g) =>
        stateRef.current.count > 1 &&
        Math.abs(g.dx) > 12 &&
        Math.abs(g.dx) > Math.abs(g.dy) * 1.2,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        const { width } = stateRef.current;
        if (Math.abs(g.dx) > width * 0.25) {
          // 화면 밖으로 날린 뒤 다음 카드(마지막이면 닫기)
          Animated.timing(pan, {
            toValue: { x: Math.sign(g.dx) * width * 1.4, y: g.dy },
            duration: 200,
            useNativeDriver: false,
          }).start(() => advanceOrClose());
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, friction: 6, useNativeDriver: false }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, friction: 6, useNativeDriver: false }).start();
      },
    })
  ).current;

  if (pages.length === 0) return null;
  const current = pages[Math.min(index, pages.length - 1)];
  const behind = pages[index + 1];
  const isLast = index + 1 >= pages.length;
  const rotate = pan.x.interpolate({
    inputRange: [-W / 2, 0, W / 2],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.overlay}>
      {/* 콘페티 — 딤 배경 위, 카드 아래 (레이어: 배경 < 콘페티 < 카드) */}
      <ConfettiField />

      {pages.length > 1 ? (
        <Text style={styles.pageIndicator}>
          {index + 1}/{pages.length}
        </Text>
      ) : null}

      <Animated.View style={[styles.stack, { opacity, transform: [{ scale }] }]}>
        {/* 뒷카드 살짝 보이게 (스택 느낌) */}
        {behind ? (
          <View style={styles.cardBehind} pointerEvents="none">
            {renderPage(behind, live)}
          </View>
        ) : null}

        <Animated.View
          {...panResponder.panHandlers}
          style={{ transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] }}
        >
          {renderPage(current, live)}
          {/* 실수 방지: 배경/카드 탭으로는 안 닫힘. 버튼은 다음 카드로(마지막이면 닫기) */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={advanceOrClose}
            hitSlop={8}
            accessibilityLabel={isLast ? '닫기' : '다음 카드'}
          >
            <Text style={styles.closeBtnText}>{isLast ? '✕' : '›'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {pages.length > 1 ? <Text style={styles.hint}>옆으로 밀어 다음 카드</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7,8,14,0.85)',
    justifyContent: 'center',
    zIndex: 1100,
    elevation: 1100,
  },
  stack: { marginHorizontal: 24 },
  cardBehind: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    opacity: 0.55,
    transform: [{ scale: 0.95 }, { translateY: 14 }],
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(13,15,26,0.72)',
    borderWidth: 1,
    borderColor: '#2E3450',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  pageIndicator: {
    position: 'absolute',
    top: 64,
    right: 24,
    fontFamily: FONT.monoMedium,
    fontSize: 13,
    color: COLORS.text,
    letterSpacing: 1,
    zIndex: 2,
  },
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
  header: {
    height: 148,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabel: {
    position: 'absolute',
    top: 13,
    left: 15,
    fontFamily: FONT.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: 'rgba(244,239,230,0.72)',
  },
  headerLabelDark: {
    fontFamily: FONT.mono,
    fontSize: 10,
    letterSpacing: 1.5,
    color: COLORS.muted,
  },
  emojiGlow: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    opacity: 0.3,
  },
  headerEmoji: { fontSize: 56 },
  body: { padding: 20 },
  gradeRow: { flexDirection: 'row', alignItems: 'center', gap: 9, flexWrap: 'wrap' },
  gradeDot: { width: 8, height: 8, borderRadius: 4 },
  gradeLabel: { fontFamily: FONT.monoMedium, fontSize: 11, letterSpacing: 1.5 },
  unescoChip: {
    backgroundColor: 'rgba(224,164,88,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(224,164,88,0.5)',
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  unescoText: { color: '#E8B877', fontSize: 10, fontWeight: '700' },
  name: { fontFamily: FONT.serif, fontSize: 26, color: '#F4EFE6', marginTop: 9 },
  compactTitle: { fontFamily: FONT.serif, fontSize: 20, color: '#F4EFE6', marginTop: 9 },
  date: { fontSize: 12, color: '#8A90A6', marginTop: 5 },
  cheer: { fontSize: 13, color: COLORS.violetSoft, marginTop: 10, lineHeight: 19 },
  xpRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 16 },
  xpValue: { fontFamily: FONT.display, fontSize: 34, color: COLORS.lime, lineHeight: 36 },
  xpUnit: { fontSize: 16 },
  extrasWrap: { marginTop: 16 },
  extrasLabel: { fontSize: 11, color: COLORS.muted },
  extrasBox: {
    backgroundColor: COLORS.fogLight,
    borderRadius: 12,
    padding: 12,
    gap: 6,
    marginTop: 8,
  },
  extrasRow: { flexDirection: 'row', alignItems: 'center' },
  extrasEmoji: { fontSize: 14 },
  extrasName: { flex: 1, color: COLORS.text, fontSize: 14, marginLeft: 8 },
  extrasXp: { fontFamily: FONT.display, fontSize: 13, color: COLORS.lime },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 20 },
  btnPrimary: {
    flex: 1.5,
    backgroundColor: COLORS.lime,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnPrimaryText: { color: COLORS.fog, fontWeight: '800', fontSize: 14 },
  btnOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#2E3450',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnShare: {
    width: 52,
    backgroundColor: COLORS.fogLight,
    borderWidth: 1,
    borderColor: '#2E3450',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: { color: COLORS.text, fontWeight: '700', fontSize: 13 },
  hint: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40,
    textAlign: 'center',
    fontFamily: FONT.mono,
    fontSize: 11,
    color: '#6B7187',
    letterSpacing: 1.5,
  },
});
