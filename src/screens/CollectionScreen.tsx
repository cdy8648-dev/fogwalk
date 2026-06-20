import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import BadgeStepper from '../components/BadgeStepper';
import Polaroid from '../components/Polaroid';
import EmptyHint from '../components/ui/EmptyHint';
import PhotoViewer from '../components/ui/PhotoViewer';
import SectionPill from '../components/ui/SectionPill';
import { COLORS } from '../constants/colors';
import { FONT } from '../constants/fonts';
import { CATEGORY_EMOJI, rarityLabel } from '../constants/landmarks';
import { getAllCountryStats } from '../services/db';
import { useLandmarkStore } from '../store/landmarkStore';
import { useMapStore } from '../store/mapStore';
import { usePhotoStore } from '../store/photoStore';
import type { Photo } from '../types';
import { codeToFlag } from '../utils/flag';

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

export default function CollectionScreen() {
  const photos = usePhotoStore((s) => s.photos);
  const landmarks = useLandmarkStore((s) => s.discovered);
  const fogVersion = useMapStore((s) => s.fogVersion);
  const [viewerPhotos, setViewerPhotos] = useState<Photo[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const countries = useMemo(() => getAllCountryStats(), [fogVersion]);

  const parkCount = landmarks.filter((l) => l.category === 'park').length;
  const peakCount = landmarks.filter((l) => l.category === 'peak').length;
  const discTiles = [
    { emoji: '🌳', name: '공원', count: parkCount, rot: -1.5 },
    { emoji: '🏛️', name: '랜드마크', count: landmarks.length - parkCount - peakCount, rot: 1.5 },
    { emoji: '⛰️', name: '산', count: peakCount, rot: -1 },
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
      <SectionPill label="뱃지" color={COLORS.lime} rotate={-2} hint="거리 진화" />
      <BadgeStepper />

      {/* 여권 */}
      <SectionPill label="여권" color={COLORS.violet} rotate={1.5} hint="지역별" />
      {countries.length === 0 ? (
        <EmptyHint>탐험한 나라가 여기 쌓여요. 해외에 가면 국기가 늘어납니다 🛂</EmptyHint>
      ) : (
        <View style={styles.passportList}>
          {countries.map((c) => (
            <View key={c.code} style={styles.passportCard}>
              <View>
                <Text style={styles.flag}>{codeToFlag(c.code)}</Text>
                <Text style={styles.countryName}>{c.name}</Text>
                <Text style={styles.countrySub}>탐험 중 🛂</Text>
              </View>
              <View style={styles.countryRight}>
                <Text style={styles.countryNum}>{c.tiles}</Text>
                <Text style={styles.countryUnit}>칸 밝힘</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 새로운 발견 */}
      <SectionPill label="새로운 발견" color={COLORS.amber} rotate={-1.5} hint="카테고리별" />
      <View style={styles.discRow}>
        {discTiles.map((t) => (
          <View
            key={t.name}
            style={[
              styles.discTile,
              { transform: [{ rotate: `${t.rot}deg` }] },
              t.count === 0 && styles.dim,
            ]}
          >
            <Text style={styles.discEmoji}>{t.emoji}</Text>
            <Text style={styles.discName}>{t.name}</Text>
            <Text style={styles.discCount}>{t.count}</Text>
          </View>
        ))}
      </View>
      {landmarks.length > 0 && (
        <View style={styles.lmList}>
          {landmarks.map((lm) => (
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

  passportList: { gap: 12 },
  passportCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.violet,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    transform: [{ rotate: '-1deg' }],
  },
  flag: { fontSize: 40 },
  countryName: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginTop: 6 },
  countrySub: { color: COLORS.muted, fontSize: 11, marginTop: 1 },
  countryRight: { alignItems: 'flex-end' },
  countryNum: { color: COLORS.violetSoft, fontSize: 42, fontFamily: FONT.display },
  countryUnit: { color: COLORS.violet, fontSize: 12, fontWeight: '700', marginTop: 2 },

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
