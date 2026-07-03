import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { ParamListBase } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Battery from '../components/ui/Battery';
import EmptyHint from '../components/ui/EmptyHint';
import StatTile from '../components/ui/StatTile';
import { COLORS } from '../constants/colors';
import { FONT } from '../constants/fonts';
import { KR_TOTAL_AREA_KM2 } from '../constants/regionAreas';
import type { CollectionStackParamList } from '../navigation/CollectionStack';
import { getRegionStats, getSubregionStats } from '../services/db';
import { useMapStore } from '../store/mapStore';
import { abbrev } from '../utils/format';
import { codeToFlag } from '../utils/flag';
import { TILE_AREA_KM2 } from '../utils/h3';

/** 밝힌 칸 수 → 면적 대비 달성률(%). 면적 미상이면 null. */
function completionPct(tiles: number, areaKm2: number | null): number | null {
  if (!areaKm2) return null;
  return (tiles * TILE_AREA_KM2) / areaKm2 * 100;
}

/** 작은 값도 읽히게: 10%↑ 정수, 1%↑ 소수1, 그 외 소수2. */
function formatPct(pct: number): string {
  if (pct >= 10) return `${Math.round(pct)}%`;
  if (pct >= 1) return `${pct.toFixed(1)}%`;
  if (pct < 0.01) return '<0.01%';
  return `${pct.toFixed(2)}%`;
}

type Props = NativeStackScreenProps<CollectionStackParamList, 'CountryRegions'>;

/**
 * 권역별 밝힌 칸 — 헤더 없는 단일 페이지. 시/도 카드가 아코디언으로 펼쳐져
 * 시/구 세부를 인라인으로 보여준다(별도 드릴 페이지 없음 → 뒤로가기 불필요).
 * 카드: 이름 | 배터리 게이지(최다 권역 대비 10칸) | 밝힌 칸 수.
 */
export default function CountryRegionsScreen({ route }: Props) {
  const { code, name } = route.params;
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NativeStackNavigationProp<CollectionStackParamList>>();
  const fogVersion = useMapStore((s) => s.fogVersion);
  // 펼쳐진 권역(한 번에 하나) — 다시 탭하면 접힘.
  const [open, setOpen] = useState<string | null>(null);

  // 헤더가 없으니 Collection 탭 재탭 = 컬렉션 홈으로 (스와이프백과 별개의 탈출구).
  useEffect(() => {
    const tab = nav.getParent<BottomTabNavigationProp<ParamListBase>>();
    if (!tab) return;
    return tab.addListener('tabPress', () => {
      if (nav.isFocused()) nav.popToTop();
    });
  }, [nav]);

  const items = useMemo(
    () => getRegionStats(code),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [code, fogVersion]
  );
  // 펼친 권역의 시/구 세부 (동기 SQLite — 펼칠 때만 조회).
  const subItems = useMemo(
    () => (open ? getSubregionStats(code, open) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [code, open, fogVersion]
  );

  const totalTiles = items.reduce((sum, r) => sum + r.tiles, 0);
  const maxTiles = items.reduce((m, r) => Math.max(m, r.tiles), 0) || 1;
  const overallPct = code === 'KR' ? completionPct(totalTiles, KR_TOTAL_AREA_KM2) : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <View style={styles.head}>
        <Text style={styles.flag}>{codeToFlag(code)}</Text>
        <Text style={styles.title}>{name}</Text>
      </View>

      {items.length === 0 ? (
        <EmptyHint>
          권역별 기록이 곧 쌓여요. (업데이트 이후 새로 밝힌 칸부터 시/도별로 모입니다 🗺️)
        </EmptyHint>
      ) : (
        <>
          <View style={styles.summary}>
            <StatTile value={String(items.length)} label="권역" accent={COLORS.violetSoft} />
            {overallPct != null && (
              <StatTile value={formatPct(overallPct)} label="국토 달성률" accent={COLORS.lime} />
            )}
            <StatTile value={abbrev(totalTiles)} label="총 밝힌 칸" accent={COLORS.violetSoft} />
          </View>

          <View style={styles.list}>
            {items.map((r) => {
              const expanded = open === r.region;
              return (
                <View key={r.region} style={styles.rowCard}>
                  <TouchableOpacity
                    style={styles.rowHead}
                    activeOpacity={0.85}
                    onPress={() => setOpen(expanded ? null : r.region)}
                    accessibilityLabel={`${r.region} ${abbrev(r.tiles)}칸 ${expanded ? '접기' : '펼치기'}`}
                  >
                    <Text style={styles.region} numberOfLines={1}>
                      {r.region}
                    </Text>
                    {/* 배터리 = 최다 권역 대비 상대 잔량 (가장 많이 밝힌 곳이 10칸) */}
                    <Battery ratio={r.tiles / maxTiles} />
                    <Text style={styles.num}>{abbrev(r.tiles)}칸</Text>
                  </TouchableOpacity>

                  {expanded && (
                    <View style={styles.subList}>
                      {subItems.length === 0 ? (
                        <Text style={styles.subEmpty}>세부 기록이 아직 없어요 🚶</Text>
                      ) : (
                        subItems.map((s) => (
                          <View key={s.region} style={styles.subRow}>
                            <Text style={styles.subName} numberOfLines={1}>
                              {s.region}
                            </Text>
                            <Text style={styles.subNum}>{abbrev(s.tiles)}칸</Text>
                          </View>
                        ))
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.fog },
  content: { padding: 16, paddingBottom: 110 }, // 플로팅 탭바 공간 확보
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  flag: { fontSize: 34 },
  title: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  summary: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  list: { gap: 12 },
  rowCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  rowHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  region: { color: COLORS.text, fontSize: 15, fontWeight: '700', flex: 1 },
  num: {
    color: COLORS.violetSoft,
    fontSize: 14,
    fontFamily: FONT.display,
    minWidth: 52,
    textAlign: 'right',
  },
  // 아코디언 펼침부 (시/구 세부)
  subList: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  subRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subName: { color: COLORS.muted, fontSize: 13, flex: 1, marginRight: 8 },
  subNum: { color: COLORS.text, fontSize: 13, fontFamily: FONT.mono },
  subEmpty: { color: COLORS.muted, fontSize: 12 },
});
