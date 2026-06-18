import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MarkerView } from '@rnmapbox/maps';

import { COLORS } from '../../constants/colors';
import { usePhotoStore } from '../../store/photoStore';
import type { Photo } from '../../types';

interface Props {
  onSelect: (photo: Photo) => void;
}

/** 게시한 사진들을 지도에 썸네일 핀으로 표시. 탭하면 onSelect. */
export default function PhotoMarkers({ onSelect }: Props) {
  const photos = usePhotoStore((s) => s.photos);

  return (
    <>
      {photos.map((photo) => (
        <MarkerView
          key={photo.id}
          id={`photo-${photo.id}`}
          coordinate={[photo.lng, photo.lat]}
          anchor={{ x: 0.5, y: 1 }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onSelect(photo)}
            style={styles.pin}
          >
            <Image source={{ uri: photo.uri }} style={styles.thumb} />
          </TouchableOpacity>
        </MarkerView>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  pin: {
    borderWidth: 2,
    borderColor: COLORS.lime,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    padding: 2,
  },
  thumb: { width: 40, height: 40, borderRadius: 7 },
});
