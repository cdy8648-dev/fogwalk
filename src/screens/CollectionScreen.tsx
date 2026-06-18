import { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ACHIEVEMENTS } from '../constants/achievements';
import { COLORS } from '../constants/colors';
import { getAllCountryStats } from '../services/db';
import { useAchievementStore } from '../store/achievementStore';
import { useMapStore } from '../store/mapStore';
import { usePhotoStore } from '../store/photoStore';
import type { Photo } from '../types';
import { codeToFlag } from '../utils/flag';

const NUM_COLS = 3;

export default function CollectionScreen() {
  const photos = usePhotoStore((s) => s.photos);
  const unlocked = useAchievementStore((s) => s.unlockedTypes);
  const fogVersion = useMapStore((s) => s.fogVersion);
  const [selected, setSelected] = useState<Photo | null>(null);

  // 여권: 국가별 탐험 칸수 (탐험할 때마다 갱신)
  const countries = useMemo(() => getAllCountryStats(), [fogVersion]);
  const maxTiles = countries.length ? countries[0].tiles : 0; // tiles desc 정렬

  const header = (
    <View style={styles.headerWrap}>
      <Text style={styles.sectionTitle}>뱃지</Text>
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

      <Text style={styles.sectionTitle}>여권</Text>
      {countries.length === 0 ? (
        <Text style={styles.passportEmpty}>
          탐험한 나라가 여기 쌓여요. 해외에 가면 국기가 늘어납니다 🛂
        </Text>
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

      <Text style={styles.sectionTitle}>사진</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        keyExtractor={(p) => p.id}
        numColumns={NUM_COLS}
        ListHeaderComponent={header}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <Text style={styles.empty}>
            아직 남긴 사진이 없어요. 지도에서 📷 버튼으로 그 자리에 남겨보세요.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cell}
            activeOpacity={0.8}
            onPress={() => setSelected(item)}
          >
            <Image source={{ uri: item.uri }} style={styles.thumb} />
          </TouchableOpacity>
        )}
      />

      <Modal
        visible={selected !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.viewerOverlay} onPress={() => setSelected(null)}>
          {selected && (
            <>
              <Image
                source={{ uri: selected.uri }}
                style={styles.viewerImage}
                resizeMode="contain"
              />
              <Text style={styles.viewerDate}>
                {new Date(selected.createdAt).toLocaleString()}
              </Text>
            </>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.fog },
  content: { padding: 4 },
  headerWrap: { paddingHorizontal: 12, paddingTop: 12 },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: {
    width: '30%',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lime,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  badgeLocked: { borderColor: COLORS.border, opacity: 0.6 },
  badgeEmoji: { fontSize: 28 },
  badgeEmojiLocked: { fontSize: 22 },
  badgeLabel: {
    color: COLORS.text,
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  badgeLabelLocked: { color: COLORS.muted },
  passportEmpty: { color: COLORS.muted, fontSize: 13, marginBottom: 8 },
  countryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  countryCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.violet,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  countryFlag: { fontSize: 34 },
  countryName: { color: COLORS.text, fontSize: 11, marginTop: 4 },
  countryTiles: { color: COLORS.violetSoft, fontSize: 12, fontWeight: '700', marginTop: 2 },
  cell: { flex: 1 / NUM_COLS, aspectRatio: 1, padding: 2 },
  thumb: { width: '100%', height: '100%', borderRadius: 8 },
  empty: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  viewerImage: { width: '100%', height: '80%' },
  viewerDate: { color: COLORS.muted, fontSize: 13, marginTop: 12 },
});
