import { Image, Modal, Pressable, StyleSheet, Text } from 'react-native';

import { COLORS } from '../../constants/colors';
import type { Photo } from '../../types';

interface Props {
  photo: Photo | null;
  onClose: () => void;
}

/** 사진 전체보기 모달 (Map·Collection 공용). */
export default function PhotoViewer({ photo, onClose }: Props) {
  return (
    <Modal
      visible={photo !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        {photo && (
          <>
            <Image
              source={{ uri: photo.uri }}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.date}>
              {new Date(photo.createdAt).toLocaleString()}
            </Text>
          </>
        )}
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  image: { width: '100%', height: '80%' },
  date: { color: COLORS.muted, fontSize: 13, marginTop: 12 },
});
