import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CircleLayer, MarkerView, ShapeSource } from '@rnmapbox/maps';

import { COLORS } from '../../constants/colors';
import { usePlaceStore } from '../../store/placeStore';
import type { Place } from '../../types';
import { PlaceIcon } from '../place/PlaceIcon';

interface Props {
  visible: boolean; // 줌 게이트 (많이 축소하면 숨김 — 사진 마커와 동일)
  full: boolean; // true=이모지+화살표, false=점 (줌아웃 시 다른 마커처럼 점으로)
  hideId?: string | null; // 이동 모드 중인 장소는 숨김 (드래그 핀으로 대체 표시)
  selectedId?: string | null; // 선택된 마커는 맥동 강조
  onSelect: (place: Place) => void;
  onLongPress: (place: Place) => void; // 롱프레스 → 위치 이동 모드
}

// 나만의 장소 시그니처 색
const PINK = '#FF6BB5';
const PINK_DARK = '#D94D97';

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
 * 나만의 장소 마커.
 * - full(줌인): 배경 없이 이모지 + 아래 화살표(꼬리)만. (추후 이모지 → 3D 렌더 이미지 예정)
 * - !full(줌아웃): 다른 마커처럼 핫핑크 점. 많이 축소하면(visible=false) 숨김.
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
            circleRadius: 5,
            circleColor: PINK,
            circleStrokeColor: COLORS.ink,
            circleStrokeWidth: 1,
          }}
        />
      </ShapeSource>
    );
  }

  // 줌인: 이모지 + 화살표 (배경 없음)
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
              <PlaceIcon value={p.emoji} size={34} />
            </View>
            <View style={styles.tail} />
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
    top: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: PINK,
  },
  // 배경 없는 글리프 — 밝은 지도에서도 읽히도록 그림자
  iconWrap: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 2.5,
    shadowOffset: { width: 0, height: 1 },
  },
  // 이모지 아래 화살표(꼬리)
  tail: {
    width: 0,
    height: 0,
    marginTop: -2,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: PINK_DARK,
  },
});
