import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CircleLayer, MarkerView, ShapeSource } from '@rnmapbox/maps';

import { MARKER_DOT, MARKER_GLYPH_SHADOW, PLACE_COLOR } from '../../constants/markerStyle';
import { usePlaceStore } from '../../store/placeStore';
import type { Place } from '../../types';
import { PlaceIcon } from '../place/PlaceIcon';

interface Props {
  visible: boolean; // 줌 게이트 (많이 축소하면 숨김 — 사진 마커와 동일)
  full: boolean; // true=글리프, false=점 (줌아웃 시 발견·사진과 동일한 점으로)
  hideId?: string | null; // 이동 모드 중인 장소는 숨김 (드래그 핀으로 대체 표시)
  selectedId?: string | null; // 선택된 마커는 맥동 강조
  onSelect: (place: Place) => void;
  onLongPress: (place: Place) => void; // 롱프레스 → 위치 이동 모드
}

/** 선택 마커 맥동 링 — 배경 없는 이모지 뒤 은은한 핫핑크 원(scale+opacity). */
function PulseRing() {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(v, {
        toValue: 1,
        duration: 2200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [v]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.pulse,
        {
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.9] }) }],
        },
      ]}
    />
  );
}

/**
 * 나만의 장소 마커 (발견·사진과 통일된 시스템).
 * - full(줌인): 배경 없는 글리프 + 공통 그림자(발견 글리프와 동일 규격). 선택 시 핑크 맥동 링.
 * - !full(줌아웃): 공통 규격 점(MARKER_DOT), 색만 핑크. 많이 축소하면(visible=false) 숨김.
 */
export default function PlaceMarkers({
  visible,
  full,
  hideId,
  selectedId,
  onSelect,
  onLongPress,
}: Props) {
  const places = usePlaceStore((s) => s.places);
  if (!visible) return null;
  const shown = places.filter((p) => p.id !== hideId);
  if (shown.length === 0) return null;

  // 줌아웃: 가벼운 점(GPU CircleLayer)
  if (!full) {
    const shape = {
      type: 'FeatureCollection' as const,
      features: shown.map((p) => ({
        type: 'Feature' as const,
        properties: {},
        geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] },
      })),
    };
    return (
      <ShapeSource id="place-dots" shape={shape}>
        <CircleLayer
          id="place-dots-layer"
          style={{
            circleRadius: MARKER_DOT.radius,
            circleColor: PLACE_COLOR,
            circleStrokeColor: MARKER_DOT.strokeColor,
            circleStrokeWidth: MARKER_DOT.strokeWidth,
          }}
        />
      </ShapeSource>
    );
  }

  // 줌인: 배경 없는 글리프 (발견 글리프와 동일 — 꼬리 없음, 정중앙 앵커)
  return (
    <>
      {shown.map((p) => (
        <MarkerView
          key={p.id}
          id={`place-${p.id}`}
          coordinate={[p.lng, p.lat]}
          anchor={{ x: 0.5, y: 0.5 }} // 정중앙 앵커 — iOS 줌 드리프트 방지
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onSelect(p)}
            onLongPress={() => onLongPress(p)}
            delayLongPress={280}
            style={styles.wrap}
            accessibilityLabel={`나만의 장소 ${p.name}`}
          >
            {selectedId === p.id && <PulseRing />}
            <View style={styles.iconWrap}>
              <PlaceIcon value={p.emoji} size={40} />
            </View>
          </TouchableOpacity>
        </MarkerView>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  pulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PLACE_COLOR,
  },
  // 배경 없는 글리프 — 밝은 지도에서도 읽히도록 공통 그림자
  iconWrap: MARKER_GLYPH_SHADOW,
});
