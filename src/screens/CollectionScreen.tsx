import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Polaroid from '../components/Polaroid';
import EmptyHint from '../components/ui/EmptyHint';
import PhotoViewer from '../components/ui/PhotoViewer';
import SectionTitle from '../components/ui/SectionTitle';
import { ACHIEVEMENTS } from '../constants/achievements';
import { COLORS } from '../constants/colors';
import { CATEGORY_EMOJI, rarityLabel } from '../constants/landmarks';
import { getAllCountryStats } from '../services/db';
import { useAchievementStore } from '../store/achievementStore';
import { useLandmarkStore } from '../store/landmarkStore';
import { useMapStore } from '../store/mapStore';
import { usePhotoStore } from '../store/photoStore';
import type { Photo } from '../types';
import { codeToFlag } from '../utils/flag';

// 폴라로이드 높이/기울기 변주 (메이슨리 핀보드 느낌)
const RATIOS = [1, 0.8, 1.3, 1.15];
const ROTS = [-2, 1.5, -1.2, 2];
function variant(id: string): { aspect: number; rot: number } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % 997;
  return { aspect: RATIOS[h % RATIOS.length], rot: ROTS[(h >> 1) % ROTS.length] };
}

export default function CollectionScreen() {
  const photos = usePhotoStore((s) => s.photos);
  const unlocked = useAchievementStore((s) => s.unlockedTypes);
  const landmarks = useLandmarkStore((s) => s.discovered);
  const fogVersion = useMapStore((s) => s.fogVersion);
  const [selected, setSelected] = useState<Photo | null>(null);

  const countries = useMemo(() => getAllCountryStats(), [fogVersion]);
  const maxTiles = countries.length ? countries[0].tiles : 0;

  const colA = photos.filter((_, i) => i % 2 === 0);
  const colB = photos.filter((_, i) => i % 2 === 1);

  const renderPolaroid = (p: Photo) => {
    const v = variant(p.id);
    return (
      <TouchableOpacity
        key={p.id}
        activeOpacity={0.9}
        onPress={() => setSelected(p)}
        style={styles.polaroidWrap}
      >
        <Polaroid uri={p.uri} aspectRatio={v.aspect} rotation={v.rot} />
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionTitle>뱃지</SectionTitle>
      <View style={styles.badgeGrid}>
        {ACHIEVEMENTS.map((def) => {
          const got = unlocked.has(def.type);
          return (
            <View key={def.type} style={[styles.badge, !got && styles.badgeLocked]}>
              <Text style={[styles.badgeEmoji, !got && styles.badgeEmojiLocked]}>
                {got ? def.emoji : '🔒'}
              </Text>
              <Text style={[styles.badgeLabel, !got && styles.badgeLabelLocked]}>
                {def.label}
              </Text>
            </View>
          );
        })}
      </View>

      <SectionTitle>여권</SectionTitle>
      {countries.length === 0 ? (
        <EmptyHint>탐험한 나라가 여기 쌓여요. 해외에 가면 국기가 늘어납니다 🛂</EmptyHint>
      ) : (
        <View style={styles.countryGrid}>
          {countries.map((c) => {
            const ratio = maxTiles > 0 ? c.tiles / maxTiles : 0;
            const side = 84 + 66 * Math.sqrt(ratio);
            return (
              <View key={c.code} style={[styles.countryCard, { width: side, height: side }]}>
                <Text style={styles.countryFlag}>{codeToFlag(c.code)}</Text>
                <Text style={styles.countryName} numberOfLines={1}>
                  {c.name}
                </Text>
                <Text style={styles.countryTiles}>{c.tiles}칸</Text>
              </View>
            );
          })}
        </View>
      )}

      <SectionTitle>랜드마크</SectionTitle>
      {landmarks.length === 0 ? (
        <EmptyHint>걷다가 명소 근처에 가면 발견돼요. 안개가 뻥 걷힙니다 🗺️</EmptyHint>
      ) : (
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

      <SectionTitle>사진</SectionTitle>
      {photos.length === 0 ? (
        <EmptyHint>지도에서 📷 버튼으로 그 자리에 사진을 남겨보세요.</EmptyHint>
      ) : (
        <View style={styles.masonry}>
          <View style={styles.masonryCol}>{colA.map(renderPolaroid)}</View>
          <View style={styles.masonryCol}>{colB.map(renderPolaroid)}</View>
        </View>
      )}

      <PhotoViewer photo={selected} onClose={() => setSelected(null)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.fog },
  content: { padding: 16, paddingBottom: 32 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: {
    width: '30.5%',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lime,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  badgeLocked: { borderColor: COLORS.border, opacity: 0.55 },
  badgeEmoji: { fontSize: 28 },
  badgeEmojiLocked: { fontSize: 22 },
  badgeLabel: { color: COLORS.text, fontSize: 11, marginTop: 6, textAlign: 'center' },
  badgeLabelLocked: { color: COLORS.muted },
  countryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  countryCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.violet,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  countryFlag: { fontSize: 34 },
  countryName: { color: COLORS.text, fontSize: 11, marginTop: 4 },
  countryTiles: { color: COLORS.violetSoft, fontSize: 12, fontWeight: '700', marginTop: 2 },
  lmList: { gap: 8 },
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
