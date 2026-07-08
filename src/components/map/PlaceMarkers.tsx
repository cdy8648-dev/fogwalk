import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MarkerView } from '@rnmapbox/maps';

import { usePlaceStore } from '../../store/placeStore';
import type { Place } from '../../types';

interface Props {
  visible: boolean; // 줌 게이트 (사진 마커와 동일 레벨)
  hideId?: string | null; // 이동 모드 중인 장소는 숨김 (드래그 핀으로 대체 표시)
  selectedId?: string | null; // 선택된 마커는 맥동 강조
  onSelect: (place: Place) => void;
  onLongPress: (place: Place) => void; // 롱프레스 → 위치 이동 모드
}

// 나만의 장소 시그니처 (핸드오프 토큰)
const PINK = '#FF6BB5';
const PINK_DARK = '#D94D97';
const FRAME = '#F4EFE6';

/** 선택 마커 맥동 링 — CSS livePulse(scale+opacity) 재현, UI 스레드. */
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
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 2.1] }) }],
        },
      ]}
    />
  );
}

/** 나만의 장소 마커 — 핫핑크 클레이 핀 + 꼬리 삼각형 + (선택 시) 맥동 링. */
export default function PlaceMarkers({
  visible,
  hideId,
  selectedId,
  onSelect,
  onLongPress,
}: Props) {
  const places = usePlaceStore((s) => s.places);
  if (!visible) return null;

  return (
    <>
      {places
        .filter((p) => p.id !== hideId)
        .map((p) => (
          <MarkerView
            key={p.id}
            id={`place-${p.id}`}
            coordinate={[p.lng, p.lat]}
            anchor={{ x: 0.5, y: 0.5 }} // 정중앙 앵커 — iOS 줌 드리프트 방지(꼬리는 좌표 살짝 아래를 가리킴)
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
              <View style={styles.pin}>
                <Text style={styles.emoji}>{p.emoji}</Text>
              </View>
              <View style={styles.tail} />
            </TouchableOpacity>
          </MarkerView>
        ))}
    </>
  );
}

const PIN = 44;

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  pulse: {
    position: 'absolute',
    top: 0,
    width: PIN,
    height: PIN,
    borderRadius: PIN / 2,
    backgroundColor: PINK,
  },
  pin: {
    width: PIN,
    height: PIN,
    borderRadius: PIN / 2,
    backgroundColor: PINK,
    borderWidth: 3,
    borderColor: FRAME,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PINK,
    shadowOpacity: 0.4,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 6 },
  },
  emoji: { fontSize: 20 },
  // 아래를 향하는 삼각형 꼬리 (border 트릭)
  tail: {
    width: 0,
    height: 0,
    marginTop: -3,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 11,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: PINK_DARK,
  },
});
