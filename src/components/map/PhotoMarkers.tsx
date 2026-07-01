import { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CircleLayer, MarkerView, ShapeSource } from '@rnmapbox/maps';
import { latLngToCell } from 'h3-js';

import { COLORS } from '../../constants/colors';
import { CONFIG } from '../../constants/config';
import { usePhotoStore } from '../../store/photoStore';
import type { Photo } from '../../types';

interface Props {
  thumbnails: boolean; // true=썸네일 마커, false=점 (줌아웃)
  visible: boolean; // false면 사진 마커 전부 숨김 (전설 전단계에서 사라짐)
  onSelect: (group: Photo[]) => void;
}

/** 사진을 같은 위치(H3 셀)끼리 묶어 표시. 여러 장이면 카운트 배지. 탭하면 그 묶음 전달. */
export default function PhotoMarkers({ thumbnails, visible, onSelect }: Props) {
  const photos = usePhotoStore((s) => s.photos);

  // 같은 셀끼리 묶기 (대표 = 가장 최근 사진 = 배열 첫 항목)
  const groups = useMemo(() => {
    const map = new Map<string, Photo[]>();
    for (const p of photos) {
      const key = latLngToCell(p.lat, p.lng, CONFIG.PHOTO_GROUP_RES);
      const arr = map.get(key);
      if (arr) arr.push(p);
      else map.set(key, [p]);
    }
    return [...map.values()];
  }, [photos]);

  const dotShape = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: groups.map((g, i) => ({
        type: 'Feature' as const,
        properties: { idx: i },
        geometry: { type: 'Point' as const, coordinates: [g[0].lng, g[0].lat] },
      })),
    }),
    [groups]
  );

  if (!visible) return null;

  if (!thumbnails) {
    return (
      <ShapeSource
        id="photo-dots"
        shape={dotShape}
        onPress={(e) => {
          const idx = e.features?.[0]?.properties?.idx as number | undefined;
          if (idx != null && groups[idx]) onSelect(groups[idx]);
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
      {groups.map((g) => (
        <MarkerView
          key={g[0].id}
          id={`photo-${g[0].id}`}
          coordinate={[g[0].lng, g[0].lat]}
          anchor={{ x: 0.5, y: 1 }}
        >
          <TouchableOpacity activeOpacity={0.8} onPress={() => onSelect(g)} style={styles.pin}>
            <Image source={{ uri: g[0].uri }} style={styles.thumb} />
            {g.length > 1 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{g.length}</Text>
              </View>
            )}
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
  badge: {
    position: 'absolute',
    top: -7,
    right: -7,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: COLORS.lime,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: COLORS.ink, fontSize: 11, fontWeight: '800' },
});
