import { useMemo } from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { CircleLayer, MarkerView, ShapeSource } from '@rnmapbox/maps';

import { COLORS } from '../../constants/colors';
import { usePhotoStore } from '../../store/photoStore';
import type { Photo } from '../../types';

interface Props {
  thumbnails: boolean; // true=썸네일 마커, false=점 (줌아웃 시)
  onSelect: (photo: Photo) => void;
}

/** 게시한 사진을 지도에 표시. 줌인=썸네일 핀, 줌아웃=점(GPU 렌더, 가벼움). */
export default function PhotoMarkers({ thumbnails, onSelect }: Props) {
  const photos = usePhotoStore((s) => s.photos);

  const dotShape = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: photos.map((p) => ({
        type: 'Feature' as const,
        properties: { id: p.id },
        geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
      })),
    }),
    [photos]
  );

  if (!thumbnails) {
    return (
      <ShapeSource
        id="photo-dots"
        shape={dotShape}
        onPress={(e) => {
          const id = e.features?.[0]?.properties?.id as string | undefined;
          const photo = photos.find((p) => p.id === id);
          if (photo) onSelect(photo);
        }}
      >
        <CircleLayer
          id="photo-dots-layer"
          style={{
            circleRadius: 5,
            circleColor: COLORS.lime,
            circleStrokeColor: COLORS.ink,
            circleStrokeWidth: 1.5,
          }}
        />
      </ShapeSource>
    );
  }

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
