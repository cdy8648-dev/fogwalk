import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { ParamListBase } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BadgeIcon from '../components/BadgeIcon';
import BadgeDetailModal from '../components/BadgeDetailModal';
import {
  AXIS_LABEL,
  AXIS_ORDER,
  BADGES,
  TIER_COLOR,
  type BadgeDef,
} from '../constants/badges';
import { COLORS } from '../constants/colors';
import { FONT } from '../constants/fonts';
import type { CollectionStackParamList } from '../navigation/CollectionStack';
import { badgeCurrentValue, badgeMetricsSnapshot } from '../services/badges';
import { useAchievementStore } from '../store/achievementStore';
import { useLandmarkStore } from '../store/landmarkStore';
import { useMapStore } from '../store/mapStore';
import { abbrev } from '../utils/format';

/**
 * 뱃지 진열장 (헤더 없음). 상단 전체 진행바 + 축별 섹션 그리드.
 * 획득 = 풀컬러 + 티어 테두리, 미획득 = 실루엣 + 조건/진행도. hidden 은 '???'.
 */
export default function BadgeDetailScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NativeStackNavigationProp<CollectionStackParamList>>();
  const unlocked = useAchievementStore((s) => s.unlockedTypes);
  // 진행도 재계산 트리거(발견·타일 변화 반영)
  const tiles = useMapStore((s) => s.visitedTileIds.size);
  const discoveredLen = useLandmarkStore((s) => s.discovered.length);

  // 헤더가 없으니 Collection 탭 재탭 = 컬렉션 홈으로 (CountryRegions 와 동일 패턴).
  useEffect(() => {
    const tab = nav.getParent<BottomTabNavigationProp<ParamListBase>>();
    if (!tab) return;
    return tab.addListener('tabPress', () => {
      if (nav.isFocused()) nav.popToTop();
    });
  }, [nav]);

  const metrics = useMemo(
    badgeMetricsSnapshot,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unlocked, tiles, discoveredLen]
  );

  const unlockedCount = BADGES.filter((b) => unlocked.has(b.id)).length;
  const overallPct = Math.round((unlockedCount / BADGES.length) * 100);

  // 뱃지 탭 → 달성 조건·진행도 설명 팝업
  const [detail, setDetail] = useState<BadgeDef | null>(null);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <Text style={styles.kicker}>ACHIEVEMENTS</Text>
      <Text style={styles.title}>뱃지 진열장</Text>

      {/* 전체 진행 카드 */}
      <View style={styles.overall}>
        <View style={styles.overallTop}>
          <Text style={styles.overallText}>
            뱃지 <Text style={styles.overallNum}>{BADGES.length}개 중 {unlockedCount}개</Text> 획득
          </Text>
          <Text style={styles.overallPct}>{overallPct}%</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${overallPct}%` }]} />
        </View>
      </View>

      {AXIS_ORDER.map((axis) => {
        const list = BADGES.filter((b) => b.axis === axis);
        if (list.length === 0) return null;
        const got = list.filter((b) => unlocked.has(b.id)).length;
        return (
          <View key={axis} style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>{AXIS_LABEL[axis]}</Text>
              <Text style={styles.sectionCount}>
                {got} / {list.length}
              </Text>
            </View>
            <View style={styles.grid}>
              {list.map((b) => (
                <BadgeCell
                  key={b.id}
                  badge={b}
                  unlocked={unlocked.has(b.id)}
                  metrics={metrics}
                  onPress={() => setDetail(b)}
                />
              ))}
            </View>
          </View>
        );
      })}

      {detail && (
        <BadgeDetailModal
          def={detail}
          metrics={metrics}
          unlocked={unlocked.has(detail.id)}
          onClose={() => setDetail(null)}
        />
      )}
    </ScrollView>
  );
}

function BadgeCell({
  badge,
  unlocked,
  metrics,
  onPress,
}: {
  badge: BadgeDef;
  unlocked: boolean;
  metrics: ReturnType<typeof badgeMetricsSnapshot>;
  onPress: () => void;
}) {
  const hiddenLocked = !unlocked && badge.hidden;
  const cur = badgeCurrentValue(badge.metric, metrics);
  const ratio = Math.min(1, cur / badge.threshold);
  // km 은 소수1, 그 외 정수. 목표 초과분은 목표값으로 클램프(진행 텍스트 깔끔하게).
  const curCapped = Math.min(cur, badge.threshold);
  const curText = badge.unit === 'km' ? curCapped.toFixed(1) : abbrev(Math.floor(curCapped));

  return (
    <TouchableOpacity style={styles.cell} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.iconWrap}>
        <BadgeIcon icon={badge.icon} size={64} locked={!unlocked} />
      </View>
      <Text
        style={[styles.name, unlocked ? { color: COLORS.text } : styles.nameLocked]}
        numberOfLines={1}
      >
        {hiddenLocked ? '???' : badge.name}
      </Text>
      {unlocked ? (
        <Text style={[styles.sub, { color: TIER_COLOR[badge.tier] }]} numberOfLines={1}>
          획득 완료
        </Text>
      ) : hiddenLocked ? (
        <Text style={styles.sub} numberOfLines={1}>
          숨겨진 뱃지
        </Text>
      ) : (
        <>
          <Text style={styles.sub} numberOfLines={2}>
            {curText}/{abbrev(badge.threshold)}
            {badge.unit}
          </Text>
          <View style={styles.miniTrack}>
            <View style={[styles.miniFill, { width: `${ratio * 100}%` }]} />
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.fog },
  content: { padding: 16, paddingBottom: 110 }, // 플로팅 탭바 공간 확보
  kicker: { color: COLORS.muted, fontSize: 12, letterSpacing: 2, fontFamily: FONT.mono },
  title: { color: COLORS.text, fontSize: 25, fontWeight: '800', marginTop: 2, marginBottom: 16 },

  overall: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 16,
  },
  overallTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  overallText: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  overallNum: { color: COLORS.lime, fontWeight: '800' },
  overallPct: { color: COLORS.lime, fontSize: 16, fontFamily: FONT.display },
  track: { height: 8, backgroundColor: COLORS.fogLight, borderRadius: 999, marginTop: 12, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: COLORS.lime, borderRadius: 999 },

  section: { marginTop: 22 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  sectionCount: { color: COLORS.muted, fontSize: 12, fontFamily: FONT.mono, letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  cell: {
    width: '31%',
    flexGrow: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 12.5, fontWeight: '800', marginTop: 8, textAlign: 'center' },
  nameLocked: { color: COLORS.muted },
  sub: { color: COLORS.muted, fontSize: 10, marginTop: 3, textAlign: 'center' },
  miniTrack: {
    height: 4,
    width: '80%',
    backgroundColor: COLORS.fogLight,
    borderRadius: 999,
    marginTop: 6,
    overflow: 'hidden',
  },
  miniFill: { height: '100%', backgroundColor: COLORS.limeDeep, borderRadius: 999 },
});
