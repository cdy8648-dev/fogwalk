import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import BadgeStepper from '../components/BadgeStepper';
import Polaroid from '../components/Polaroid';
import EmptyHint from '../components/ui/EmptyHint';
import PhotoViewer from '../components/ui/PhotoViewer';
import SectionPill from '../components/ui/SectionPill';
import { COLORS } from '../constants/colors';
import { FONT } from '../constants/fonts';
import { CATEGORY_EMOJI, rarityLabel } from '../constants/landmarks';
import type { CollectionStackParamList, DiscoveryFilter } from '../navigation/CollectionStack';
import { getAllCountryStats } from '../services/db';
import { useLandmarkStore } from '../store/landmarkStore';
import { useMapStore } from '../store/mapStore';
import { usePhotoStore } from '../store/photoStore';
import type { Photo } from '../types';
import { abbrev } from '../utils/format';
import { codeToFlag } from '../utils/flag';

type Nav = NativeStackNavigationProp<CollectionStackParamList>;
const PASSPORT_TEASER = 3;
const LANDMARK_TEASER = 5;

const RATIOS = [1, 0.8, 1.3, 1.15];
const ROTS = [-2, 1.5, -1.2, 2];
function variant(id: string): { aspect: number; rot: number } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % 997;
  return { aspect: RATIOS[h % RATIOS.length], rot: ROTS[(h >> 1) % ROTS.length] };
}

function photoTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// 섹션 라벨 pill + (있으면) "전체보기 ›" 링크. 탭하면 상세로.
function SectionHead(props: {
  label: string;
  color: string;
  rotate?: number;
  hint?: string;
  onPress?: () => void;
}) {
  const { onPress, ...pill } = props;
  if (!onPress) return <SectionPill {...pill} />;
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.secHead}>
      <SectionPill {...pill} />
      <Text style={styles.more}>전체보기 ›</Text>
    </TouchableOpacity>
  );
}

export default function CollectionScreen() {
  const nav = useNavigation<Nav>();
  const photos = usePhotoStore((s) => s.photos);
  const landmarks = useLandmarkStore((s) => s.discovered);
  const fogVersion = useMapStore((s) => s.fogVersion);
  const [viewerPhotos, setViewerPhotos] = useState<Photo[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const countries = useMemo(() => getAllCountryStats(), [fogVersion]);

  const parkCount = landmarks.filter((l) => l.category === 'park').length;
  const peakCount = landmarks.filter((l) => l.category === 'peak').length;
  const subwayCount = landmarks.filter((l) => l.category === 'subway').length;
  const discTiles: { emoji: string; name: string; count: number; rot: number; filter: DiscoveryFilter }[] = [
    { emoji: '🌳', name: '공원', count: parkCount, rot: -1.5, filter: 'park' },
    {
      emoji: '🏛️',
      name: '랜드마크',
      count: landmarks.length - parkCount - peakCount - subwayCount,
      rot: 1.5,
      filter: 'landmark',
    },
    { emoji: '⛰️', name: '산', count: peakCount, rot: -1, filter: 'peak' },
    { emoji: '🚇', name: '지하철', count: subwayCount, rot: 1, filter: 'subway' },
  ];

  const colA = photos.filter((_, i) => i % 2 === 0);
  const colB = photos.filter((_, i) => i % 2 === 1);
  const renderPolaroid = (p: Photo) => {
    const v = variant(p.id);
    return (
      <TouchableOpacity
        key={p.id}
        activeOpacity={0.9}
        onPress={() => {
          setViewerPhotos(photos);
          setViewerIndex(photos.indexOf(p));
        }}
        style={styles.polaroidWrap}
      >
        <Polaroid uri={p.uri} aspectRatio={v.aspect} rotation={v.rot} caption={photoTime(p.createdAt)} />
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>COLLECTION</Text>
      <Text style={styles.title}>모아둔 것들</Text>

      {/* 뱃지 — 거리 진화 */}
      <SectionHead
        label="뱃지"
        color={COLORS.lime}
        rotate={-2}
        hint="칸 발견"
        onPress={() => nav.navigate('BadgeDetail')}
      />
      <BadgeStepper />

      {/* 여권 */}
      <SectionHead
        label="여권"
        color={COLORS.violet}
        rotate={1.5}
        hint="지역별"
        onPress={countries.length > 0 ? () => nav.navigate('PassportDetail') : undefined}
      />
      {countries.length === 0 ? (
        <EmptyHint>탐험한 나라가 여기 쌓여요. 해외에 가면 국기가 늘어납니다 🛂</EmptyHint>
      ) : (
        <View style={styles.passportList}>
          {countries.slice(0, PASSPORT_TEASER).map((c) => (
            <TouchableOpacity
              key={c.code}
              style={styles.ppCard}
              activeOpacity={0.85}
              onPress={() => nav.navigate('CountryRegions', { code: c.code, name: c.name })}
            >
              <Text style={styles.ppFlag}>{codeToFlag(c.code)}</Text>
              <View style={styles.ppSpacer} />
              <Text style={styles.ppNum} numberOfLines={1}>
                {abbrev(c.tiles)}
              </Text>
              <Text style={styles.ppUnit}>칸 밝힘</Text>
              <Text style={styles.ppName} numberOfLines={1}>
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
          {countries.length === 1 && (
            <View style={[styles.ppCard, styles.ppCardEmpty]}>
              <Text style={styles.ppFlag}>✈️</Text>
              <View style={styles.ppSpacer} />
              <Text style={styles.ppHint}>다른 나라도{'\n'}탐험해보세요</Text>
            </View>
          )}
        </View>
      )}

      {/* 새로운 발견 */}
      <SectionHead
        label="새로운 발견"
        color={COLORS.amber}
        rotate={-1.5}
        hint="카테고리별"
        onPress={landmarks.length > 0 ? () => nav.navigate('DiscoveryDetail') : undefined}
      />
      <View style={styles.discRow}>
        {discTiles.map((t) => (
          <TouchableOpacity
            key={t.name}
            activeOpacity={0.85}
            onPress={() => nav.navigate('DiscoveryDetail', { filter: t.filter })}
            style={[
              styles.discTile,
              { transform: [{ rotate: `${t.rot}deg` }] },
              t.count === 0 && styles.dim,
            ]}
          >
            <Text style={styles.discEmoji}>{t.emoji}</Text>
            <Text style={styles.discName}>{t.name}</Text>
            <Text style={styles.discCount}>{t.count}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {landmarks.length > 0 && (
        <View style={styles.lmList}>
          {landmarks.slice(0, LANDMARK_TEASER).map((lm) => (
            <View key={lm.osmId} style={styles.lmRow}>
              <Text style={styles.lmEmoji}>{CATEGORY_EMOJI[lm.category] ?? '📍'}</Text>
              <Text style={styles.lmName} numberOfLines={1}>
                {lm.name}
              </Text>
              <Text style={styles.lmRarity}>{rarityLabel(lm.rarity)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 사진 */}
      <SectionPill label="사진" color={COLORS.teal} rotate={1.5} />
      {photos.length === 0 ? (
        <EmptyHint>지도에서 📷 버튼으로 그 자리에 사진을 남겨보세요.</EmptyHint>
      ) : (
        <View style={styles.masonry}>
          <View style={styles.masonryCol}>{colA.map(renderPolaroid)}</View>
          <View style={styles.masonryCol}>{colB.map(renderPolaroid)}</View>
        </View>
      )}

      <PhotoViewer
        photos={viewerPhotos}
        initialIndex={viewerIndex}
        onClose={() => setViewerPhotos([])}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.fog },
  content: { padding: 16, paddingBottom: 32 },
  kicker: { color: COLORS.muted, fontSize: 12, letterSpacing: 2, marginTop: 2, fontFamily: FONT.mono },
  title: { color: COLORS.text, fontSize: 25, fontWeight: '800', marginTop: 2 },

  secHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  more: { color: COLORS.muted, fontSize: 12, fontWeight: '700' },

  passportList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ppCard: {
    width: 100,
    height: 124,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.violet,
    borderRadius: 14,
    padding: 11,
    transform: [{ rotate: '-1.5deg' }],
  },
  ppCardEmpty: {
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    transform: [{ rotate: '1.5deg' }],
  },
  ppFlag: { fontSize: 24 },
  ppSpacer: { flex: 1 },
  ppNum: { color: COLORS.violetSoft, fontSize: 30, fontFamily: FONT.display },
  ppUnit: { color: COLORS.violet, fontSize: 10, fontWeight: '700', marginTop: -2 },
  ppName: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  ppHint: { color: COLORS.muted, fontSize: 11, fontWeight: '600', lineHeight: 15 },

  discRow: { flexDirection: 'row', gap: 10 },
  discTile: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  dim: { opacity: 0.55 },
  discEmoji: { fontSize: 30 },
  discName: { color: COLORS.text, fontSize: 12, fontWeight: '700', marginTop: 6 },
  discCount: { color: COLORS.amber, fontSize: 16, fontFamily: FONT.display, marginTop: 2 },

  lmList: { gap: 8, marginTop: 12 },
  lmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  lmEmoji: { fontSize: 20, marginRight: 10 },
  lmName: { color: COLORS.text, fontSize: 14, flex: 1 },
  lmRarity: { color: COLORS.amber, fontSize: 12, fontWeight: '700' },

  masonry: { flexDirection: 'row', gap: 14 },
  masonryCol: { flex: 1, gap: 16 },
  polaroidWrap: { marginBottom: 2 },
});
