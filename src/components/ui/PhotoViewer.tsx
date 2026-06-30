import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';

import { COLORS } from '../../constants/colors';
import { FONT } from '../../constants/fonts';
import { removePhoto } from '../../services/photos';
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

/** 사진 전체보기 (Map·Collection 공용). 폴라로이드 확대 + 스와이프 + 저장/삭제. */
export default function PhotoViewer({ photos, initialIndex = 0, onClose }: Props) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);
  const imgW = Math.min(width * 0.72, 300);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex, photos]);

  const open = photos.length > 0;
  const current = open ? photos[Math.min(index, photos.length - 1)] : null;

  const handleDownload = async () => {
    if (!current) return;
    try {
      // 전체 권한 필요: 네이티브 저장이 UIImageWriteToSavedPhotosAlbum(레거시)을 써서
      // "추가 전용(write-only)" 권한으로는 실패함.
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('사진 접근 권한 필요', '설정 > FogWalk 에서 사진 권한을 허용해주세요.');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(current.uri);
      Alert.alert('저장 완료', '사진을 앨범에 저장했어요 📸');
    } catch (e) {
      Alert.alert('저장 실패', e instanceof Error ? e.message : '잠시 후 다시 시도해주세요.');
    }
  };

  const handleDelete = () => {
    if (!current) return;
    Alert.alert('사진 삭제', '이 사진을 삭제할까요? 되돌릴 수 없어요.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          removePhoto(current.id, current.uri);
          onClose();
        },
      },
    ]);
  };

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

          <View style={styles.footer} pointerEvents="box-none">
            {photos.length > 1 && (
              <View style={styles.dots}>
                {photos.map((p, i) => (
                  <View key={p.id} style={[styles.dot, i === index && styles.dotActive]} />
                ))}
              </View>
            )}
            <View style={styles.actions}>
              <TouchableOpacity onPress={handleDownload} style={styles.actionBtn} activeOpacity={0.8}>
                <Ionicons name="download-outline" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.actionBtn} activeOpacity={0.8}>
                <Ionicons name="trash-outline" size={23} color={COLORS.hotpink} />
              </TouchableOpacity>
            </View>
          </View>
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
  footer: {
    position: 'absolute',
    bottom: 44,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 18,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.lime },
  actions: { flexDirection: 'row', gap: 28 },
  actionBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
