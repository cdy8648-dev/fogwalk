import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

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

/**
 * 하단에 떠 있는 글래스모피즘 탭바(아이폰 느낌). 기본 솔리드 바 대신 사용.
 * BlurView(다크) + 반투명 틴트 + 라운드 알약. 활성=그라데이션 아이콘+은은한 라임 글로우,
 * 비활성=clay 무채색 아이콘. Map은 풀블리드라 바 주변으로 지도가 비쳐 보인다.
 */
export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + 10 }]} pointerEvents="box-none">
      <View style={styles.shadow}>
        <View style={styles.pill}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.tint} />
          {state.routes.map((route, index) => {
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
                <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                  <Image
                    source={focused ? ICONS[route.name].active : ICONS[route.name].idle}
                    style={[styles.icon, focused && styles.iconActive, !focused && styles.iconIdle]}
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
            );
          })}
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
  // 활성은 그라데이션 아이콘 자체가 시그널 → 은은한 라임 글로우 배경만.
  iconWrapActive: {
    backgroundColor: 'rgba(200,245,96,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(200,245,96,0.35)',
  },
  icon: { width: 28, height: 28 },
  iconActive: { width: 30, height: 30 }, // 활성 살짝 크게
  iconIdle: { opacity: 0.9 }, // clay는 이미 무채색 → 살짝만 낮춤
});
