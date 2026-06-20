import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { COLORS } from '../../constants/colors';
import type { Photo } from '../../types';

interface Props {
  photos: Photo[]; // 빈 배열 = 닫힘
  initialIndex?: number;
  onClose: () => void;
}

/** 사진 전체보기 (Map·Collection 공용). 여러 장이면 좌우 스와이프 + 페이지 닷. */
export default function PhotoViewer({ photos, initialIndex = 0, onClose }: Props) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex, photos]);

  const open = photos.length > 0;
  const current = open ? photos[Math.min(index, photos.length - 1)] : null;

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      {open && (
        <View style={styles.overlay}>
          <FlatList
            key={`${photos.length}-${photos[0]?.id ?? ''}-${initialIndex}`}
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialIndex}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            keyExtractor={(p) => p.id}
            onMomentumScrollEnd={(e) =>
              setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
            }
            renderItem={({ item }) => (
              <Pressable style={[styles.page, { width }]} onPress={onClose}>
                <Image source={{ uri: item.uri }} style={styles.image} resizeMode="contain" />
              </Pressable>
            )}
          />
          <View style={styles.footer} pointerEvents="none">
            {current && (
              <Text style={styles.date}>
                {new Date(current.createdAt).toLocaleString()}
              </Text>
            )}
            {photos.length > 1 && (
              <View style={styles.dots}>
                {photos.map((p, i) => (
                  <View key={p.id} style={[styles.dot, i === index && styles.dotActive]} />
                ))}
              </View>
            )}
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(5,6,12,0.94)' },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  image: { width: '100%', height: '78%' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40,
    alignItems: 'center',
  },
  date: { color: COLORS.muted, fontSize: 13, marginBottom: 12 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: { backgroundColor: COLORS.lime },
});
