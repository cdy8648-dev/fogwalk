import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { useMapUiStore } from '../store/mapUiStore';

// 탭별 아이콘: 활성=3D 그라데이션(컬러), 비활성=clay(무채색).
const ICONS: Record<string, { active: ReturnType<typeof require>; idle: ReturnType<typeof require> }> = {
  Map: {
    active: require('../../assets/tab-map.png'),
    idle: require('../../assets/tab-map-clay.png'),
  },
  Collection: {
    active: require('../../assets/tab-collection.png'),
    idle: require('../../assets/tab-collection-clay.png'),
  },
  Profile: {
    active: require('../../assets/tab-profile.png'),
    idle: require('../../assets/tab-profile-clay.png'),
  },
};

const CAMERA_ACTIVE = require('../../assets/tab-camera.png');
const CAMERA_IDLE = require('../../assets/tab-camera-clay.png');

/**
 * 하단에 떠 있는 글래스모피즘 탭바(아이폰 느낌). 기본 솔리드 바 대신 사용.
 * BlurView(다크) + 반투명 틴트 + 라운드 알약. 활성=그라데이션 아이콘+은은한 라임 글로우,
 * 비활성=clay 무채색 아이콘. Map은 풀블리드라 바 주변으로 지도가 비쳐 보인다.
 */
export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const capture = useMapUiStore((s) => s.capture);
  const capturing = useMapUiStore((s) => s.capturing);
  // 카메라(액션 버튼)는 Map 탭이 활성일 때만 활성화 — 사진은 지도에서만 남긴다.
  const mapActive = state.routes[state.index]?.name === 'Map';

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + 10 }]} pointerEvents="box-none">
      <View style={styles.shadow}>
        <View style={styles.pill}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.tint} />
          {state.routes.map((route, index) => {
            const icons = ICONS[route.name];
            if (!icons) return null; // ICONS 미등록 라우트는 크래시 대신 숨김
            const focused = state.index === index;
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            };
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={0.8}
                style={styles.tab}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={route.name}
              >
                <View style={styles.iconWrap}>
                  <Image
                    source={focused ? icons.active : icons.idle}
                    style={[styles.icon, focused && styles.iconActive, !focused && styles.iconIdle]}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
            );
          })}

          {/* 카메라 액션 버튼 (Profile 오른쪽). Map 활성일 때만 촬영 가능. */}
          <View style={styles.divider} />
          <TouchableOpacity
            onPress={() => {
              if (mapActive && !capturing) capture();
            }}
            disabled={!mapActive || capturing}
            activeOpacity={0.8}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityLabel="사진 남기기"
            accessibilityState={{ disabled: !mapActive }}
          >
            <View style={styles.iconWrap}>
              <Image
                source={mapActive ? CAMERA_ACTIVE : CAMERA_IDLE}
                style={[
                  styles.icon,
                  mapActive && styles.iconActive,
                  !mapActive && styles.iconIdle,
                  capturing && styles.iconCapturing,
                ]}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  // 그림자 전용 바깥 뷰 (overflow:hidden 이 그림자를 자르지 않도록 분리).
  shadow: {
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  pill: {
    flexDirection: 'row',
    borderRadius: 30,
    overflow: 'hidden', // BlurView·활성 배경을 라운드로 클립
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15,17,32,0.45)',
  },
  tab: { paddingHorizontal: 6 },
  iconWrap: {
    width: 60,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 활성 시그널은 그라데이션 아이콘 + 살짝 큰 크기만 (배경 글로우 없음).
  icon: { width: 28, height: 28 },
  iconActive: { width: 30, height: 30 }, // 활성 살짝 크게
  iconIdle: { opacity: 0.9 }, // clay는 이미 무채색 → 살짝만 낮춤
  iconCapturing: { opacity: 0.4 }, // 촬영 중 표시
  // 탭(내비게이션) 과 카메라(액션) 를 시각적으로 분리하는 얇은 구분선
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 26,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'center',
    marginHorizontal: 4,
  },
});
