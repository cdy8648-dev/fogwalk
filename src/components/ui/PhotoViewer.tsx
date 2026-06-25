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
import { FONT } from '../../constants/fonts';
import type { Photo } from '../../types';
import Tape from './Tape';

interface Props {
  photos: Photo[]; // 빈 배열 = 닫힘
  initialIndex?: number;
  onClose: () => void;
}

function caption(ts: number): string {
  return new Date(ts).toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** 사진 전체보기 (Map·Collection 공용). 폴라로이드 확대 + 좌우 스와이프 + 페이지 닷. */
export default function PhotoViewer({ photos, initialIndex = 0, onClose }: Props) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);
  const imgW = Math.min(width * 0.72, 300);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex, photos]);

  const open = photos.length > 0;

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
                <View style={styles.frame}>
                  <Tape width={84} height={22} rotate={-3} style={styles.washiPos} />
                  <Image
                    source={{ uri: item.uri }}
                    style={[styles.image, { width: imgW, height: imgW }]}
                    resizeMode="cover"
                  />
                  <Text style={styles.caption} numberOfLines={1}>
                    📍 {caption(item.createdAt)}
                  </Text>
                </View>
              </Pressable>
            )}
          />
          {photos.length > 1 && (
            <View style={styles.dots} pointerEvents="none">
              {photos.map((p, i) => (
                <View key={p.id} style={[styles.dot, i === index && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(5,6,12,0.94)' },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  frame: {
    backgroundColor: COLORS.paper,
    borderRadius: 8,
    padding: 12,
    paddingBottom: 18,
    transform: [{ rotate: '-2deg' }],
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
  washiPos: { position: 'absolute', top: -11, alignSelf: 'center', zIndex: 2 },
  image: { borderRadius: 3, backgroundColor: COLORS.fogLight },
  caption: {
    color: COLORS.paperInk,
    fontSize: 13,
    letterSpacing: 0.5,
    marginTop: 12,
    paddingHorizontal: 2,
    fontFamily: FONT.mono,
  },
  dots: {
    position: 'absolute',
    bottom: 44,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.lime },
});
