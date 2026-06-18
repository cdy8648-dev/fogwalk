import { useState } from 'react';
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

import { COLORS } from '../constants/colors';
import { usePhotoStore } from '../store/photoStore';
import type { Photo } from '../types';

const NUM_COLS = 3;

export default function CollectionScreen() {
  const photos = usePhotoStore((s) => s.photos);
  const [selected, setSelected] = useState<Photo | null>(null);

  if (photos.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>아직 남긴 사진이 없어요</Text>
        <Text style={styles.emptyDesc}>
          걸어서 필름을 모으고, 지도에서 📷 버튼으로 그 자리에 사진을 남겨보세요.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        keyExtractor={(p) => p.id}
        numColumns={NUM_COLS}
        contentContainerStyle={styles.grid}
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
  grid: { padding: 2 },
  cell: { flex: 1 / NUM_COLS, aspectRatio: 1, padding: 2 },
  thumb: { width: '100%', height: '100%', borderRadius: 8 },
  empty: {
    flex: 1,
    backgroundColor: COLORS.fog,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyDesc: { color: COLORS.muted, fontSize: 14, textAlign: 'center' },
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
