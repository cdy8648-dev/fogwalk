import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { ParamListBase } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PassportCover from '../components/passport/PassportCover';
import RegionStampRow, { type RegionRowData } from '../components/passport/RegionStampRow';
import EmptyHint from '../components/ui/EmptyHint';
import { FONT } from '../constants/fonts';
import {
  KR_REGION_CENTER,
  KR_REGION_COUNT,
  KR_TOTAL_AREA_KM2,
  regionAreaKm2,
  regionEnName,
  regionKey,
} from '../constants/regionAreas';
import type { CollectionStackParamList } from '../navigation/CollectionStack';
import { getAllCountryStats, getRegionStats, getSubregionStats } from '../services/db';
import { l1TotalTiles, l2TotalTiles } from '../services/regionPack';
import { useMapStore } from '../store/mapStore';
import { haversineMeters } from '../utils/distance';
import { COLORS } from '../constants/colors';
import { TILE_AREA_KM2 } from '../utils/h3';
import { fs } from '../utils/responsive';

/** 밝힌 칸 수 → 면적 대비 달성률(%). 면적 미상이면 null. */
function completionPct(tiles: number, areaKm2: number | null): number | null {
  if (!areaKm2) return null;
  return (tiles * TILE_AREA_KM2) / areaKm2 * 100;
}

/** 소수점 1자리로 통일: 10%↑ 정수, 그 외 소수1 (예: 0.36 → 0.4). 반올림 시 0.0 되는 미세값은 <0.1%. */
function formatPct(pct: number): string {
  if (pct >= 10) return `${Math.round(pct)}%`;
  if (pct > 0 && pct < 0.05) return '<0.1%';
  return `${pct.toFixed(1)}%`;
}

type Props = NativeStackScreenProps<CollectionStackParamList, 'CountryRegions'>;

/**
 * 국가 상세 — 디지털 여권 (디자인 핸드오프 1a).
 * 여권 표지 카드(달성률 스탬프) + 지역 비자 스탬프 리스트(아코디언) + 다음 지역 티저.
 * 헤더 없음 — Collection 탭 재탭 시 홈으로, iOS 스와이프백 지원.
 */
export default function CountryRegionsScreen({ route }: Props) {
  const { code, name } = route.params;
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NativeStackNavigationProp<CollectionStackParamList>>();
  const fogVersion = useMapStore((s) => s.fogVersion);
  const [open, setOpen] = useState<string | null>(null);

  // 헤더가 없으니 Collection 탭 재탭 = 컬렉션 홈으로.
  useEffect(() => {
    const tab = nav.getParent<BottomTabNavigationProp<ParamListBase>>();
    if (!tab) return;
    return tab.addListener('tabPress', () => {
      if (nav.isFocused()) nav.popToTop();
    });
  }, [nav]);

  // 지역 행 데이터: 달성률·영문명·하위 시(칸수 내림차순) 붙여서 진행률 내림차순 정렬.
  // 팩 보유국(KR·다운로드한 해외)은 H3 팩 분모(타일 단위 — 분자와 같은 통화)로, 그 외는 면적(km²) 폴백.
  const rows: RegionRowData[] = useMemo(
    () =>
      getRegionStats(code)
        .map((r) => {
          const packTotal = l1TotalTiles(code, r.region);
          const area = regionAreaKm2(code, r.region);
          const pct =
            packTotal != null && packTotal > 0
              ? (r.tiles / packTotal) * 100
              : completionPct(r.tiles, area);
          return {
            name: r.region,
            en: regionEnName(code, r.region),
            pct,
            pctText: pct != null ? formatPct(pct) : null,
            tiles: r.tiles,
            remainingTiles:
              packTotal != null
                ? Math.max(0, packTotal - r.tiles)
                : area != null
                  ? Math.max(0, Math.round(area / TILE_AREA_KM2) - r.tiles)
                  : null,
            subs: [...getSubregionStats(code, r.region)]
              .sort((a, b) => b.tiles - a.tiles)
              .map((s) => {
                const subTotal = l2TotalTiles(code, s.region);
                const subPct =
                  subTotal != null && subTotal > 0 ? (s.tiles / subTotal) * 100 : null;
                return {
                  region: s.region,
                  tiles: s.tiles,
                  pctText: subPct != null ? formatPct(subPct) : null,
                };
              }),
          };
        })
        .sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1) || b.tiles - a.tiles),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [code, fogVersion]
  );

  const totalTiles = rows.reduce((sum, r) => sum + r.tiles, 0);
  const maxTiles = rows.reduce((m, r) => Math.max(m, r.tiles), 0) || 1;
  const overallPct = code === 'KR' ? completionPct(totalTiles, KR_TOTAL_AREA_KM2) : null;

  // 여권번호: 첫 방문일(MMDD) 기반 — 유저마다 다른 재미 요소, 결정적이라 항상 동일.
  const passportNo = useMemo(() => {
    const c = getAllCountryStats().find((x) => x.code === code);
    if (!c || c.firstVisitedAt <= 0) return `${code}-0000`;
    const d = new Date(c.firstVisitedAt);
    return `${code}-${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, fogVersion]);

  // 다음 지역 티저: 현 위치에서 가장 가까운 미방문 시/도 (KR + 위치 있을 때만).
  const teaser = useMemo(() => {
    if (code !== 'KR') return null;
    const loc = useMapStore.getState().currentLocation;
    if (!loc) return null;
    const visited = new Set(rows.map((r) => regionKey(r.name)).filter(Boolean));
    let best: { key: string; m: number } | null = null;
    for (const [key, center] of Object.entries(KR_REGION_CENTER)) {
      if (visited.has(key)) continue;
      const m = haversineMeters(loc, center);
      if (!best || m < best.m) best = { key, m };
    }
    return best ? { name: best.key, km: Math.max(1, Math.round(best.m / 1000)) } : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, rows]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <PassportCover
        code={code}
        name={name}
        pct={overallPct}
        pctText={overallPct != null ? formatPct(overallPct) : null}
        totalTiles={totalTiles}
        visitedRegions={rows.length}
        totalRegions={code === 'KR' ? KR_REGION_COUNT : null}
        passportNo={passportNo}
        regionEns={rows.map((r) => r.en).filter((e): e is string => e != null)}
      />

      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>지역 스탬프</Text>
        <Text style={styles.sectionCount}>
          {code === 'KR' ? `${rows.length} / ${KR_REGION_COUNT}` : String(rows.length)}
        </Text>
      </View>

      {rows.length === 0 ? (
        <EmptyHint>
          권역별 기록이 곧 쌓여요. (업데이트 이후 새로 밝힌 칸부터 시/도별로 모입니다 🗺️)
        </EmptyHint>
      ) : (
        <View style={styles.list}>
          {rows.map((r, i) => (
            <RegionStampRow
              key={r.name}
              data={r}
              top={i === 0}
              rotate={i % 2 === 0 ? -6 : 5}
              // 진행바: 달성률(작은 값은 최소 2% 보이게), 면적 미상이면 최다 지역 대비
              barRatio={
                r.pct != null
                  ? Math.max(r.pct, r.tiles > 0 ? 2 : 0) / 100
                  : r.tiles / maxTiles
              }
              expanded={open === r.name}
              onToggle={() => setOpen(open === r.name ? null : r.name)}
            />
          ))}

          {teaser && (
            <View style={styles.teaser}>
              <View style={styles.teaserBox}>
                <Text style={styles.teaserPlane}>✈️</Text>
              </View>
              <View style={styles.teaserBody}>
                <Text style={styles.teaserTitle}>다음 스탬프는 어디?</Text>
                <Text style={styles.teaserDesc}>
                  {teaser.name}까지 {teaser.km}km — 가장 가까운 새 지역
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.fog },
  content: { padding: 16, paddingBottom: 110 }, // 플로팅 탭바 공간 확보
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 11,
    paddingHorizontal: 2,
  },
  sectionTitle: { fontSize: fs(13), fontWeight: '800', color: '#E2E5EE' },
  sectionCount: { fontFamily: FONT.mono, fontSize: fs(10), letterSpacing: 1, color: '#7C8294' },
  list: { gap: 10 },
  // 다음 지역 티저 (dashed 잠금 카드)
  teaser: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#2E3450',
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    opacity: 0.85,
  },
  teaserBox: {
    width: 52,
    height: 52,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#3C435C',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  teaserPlane: { fontSize: fs(18) },
  teaserBody: { flex: 1 },
  teaserTitle: { fontSize: fs(13), fontWeight: '700', color: '#6B7187' },
  teaserDesc: { fontSize: fs(10.5), color: '#4C5268', marginTop: 2 },
});
