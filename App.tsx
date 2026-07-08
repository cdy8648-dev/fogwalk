import { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { DMMono_400Regular, DMMono_500Medium } from '@expo-google-fonts/dm-mono';
import { NotoSerifKR_700Bold } from '@expo-google-fonts/noto-serif-kr';
import Mapbox from '@rnmapbox/maps';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import CelebrationOverlay from './src/components/CelebrationOverlay';
import DiscoveryOverlayHost from './src/components/discovery/DiscoveryOverlayHost';
import { COLORS } from './src/constants/colors';
import { hydrateCountry, refreshCountry } from './src/services/country';
import { initDatabase } from './src/services/db';
import { flushPendingBadgePopups } from './src/services/badges';
import { flushPendingDiscoveries } from './src/services/discovery';
import { migrateDiscoveryDisplayNames } from './src/services/landmarkNames';
import { backfillInkOnce, refreshProgressStore } from './src/services/progress';
import { useAchievementStore } from './src/store/achievementStore';
import { useLandmarkStore } from './src/store/landmarkStore';
import { useMapStore } from './src/store/mapStore';
import { usePhotoStore } from './src/store/photoStore';
import { usePlaceStore } from './src/store/placeStore';
import { useSettingsStore } from './src/store/settingsStore';
import MapScreen from './src/screens/MapScreen';
import CollectionStack from './src/navigation/CollectionStack';
import ProfileScreen from './src/screens/ProfileScreen';
import CustomTabBar from './src/components/CustomTabBar';

// app.json 의 extra 에서 Mapbox 퍼블릭 토큰을 읽어 1회 설정.
const mapboxToken = (Constants.expoConfig?.extra as { mapboxPublicToken?: string } | undefined)
  ?.mapboxPublicToken;
if (mapboxToken) {
  Mapbox.setAccessToken(mapboxToken);
} else {
  console.warn('[mapbox] extra.mapboxPublicToken 이 설정되지 않았습니다. app.json 을 확인하세요.');
}

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: COLORS.fog,
    card: COLORS.surface,
    border: COLORS.border,
    primary: COLORS.lime,
    text: COLORS.text,
  },
};

export default function App() {
  const [ready, setReady] = useState(false);
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_700Bold,
    DMMono_400Regular,
    DMMono_500Medium,
    NotoSerifKR_700Bold,
  });

  useEffect(() => {
    initDatabase(); // DB 준비
    hydrateCountry(); // 마지막 국가 복원(즉시 적립 가능)
    useMapStore.getState().hydrate(); // DB → Set 복원
    useAchievementStore.getState().hydrate(); // DB → 해금 뱃지 복원(중복알림 방지)
    backfillInkOnce(); // 잉크 도입 1회: 기존 거리에서 소급 지급
    refreshProgressStore(); // DB → 진행도 복원 (뱃지 체크 포함)
    usePhotoStore.getState().hydrate(); // DB → 사진 복원
    usePlaceStore.getState().hydrate(); // DB → 나만의 장소 복원
    useLandmarkStore.getState().hydrate(); // DB → 발견 랜드마크 복원
    useSettingsStore.getState().hydrate(); // DB → 설정(지도 스타일) 복원
    flushPendingDiscoveries(); // 백그라운드/이전 세션 발견 → 요약 카드
    flushPendingBadgePopups(); // 백그라운드/이전 세션 뱃지 획득 → 보상 카드 (발견 뒤에 이어짐)
    void migrateDiscoveryDisplayNames(); // 현지어로 저장된 발견 이름 → 유저 언어로 보강(백그라운드)
    setReady(true);
  }, []);

  // 포그라운드 복귀 시, 백그라운드에서 쌓인 타일·진행도를 반영
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        useMapStore.getState().hydrate();
        refreshProgressStore();
        flushPendingDiscoveries(); // 백그라운드 발견 → 요약 카드
        flushPendingBadgePopups(); // 백그라운드 뱃지 획득 → 보상 카드
        void refreshCountry(); // 해외 도착 등 먼 이동 시 국가 선제 감지
      }
    });
    return () => sub.remove();
  }, []);

  if (!ready || !fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.lime} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <Tab.Navigator
          tabBar={(props) => <CustomTabBar {...props} />} // 글래스모피즘 플로팅 탭바
          screenOptions={{ headerShown: false }} // 탭 화면은 헤더 없음(콘텐츠 상단 여백으로 처리)
        >
          <Tab.Screen name="Map" component={MapScreen} />
          <Tab.Screen name="Collection" component={CollectionStack} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      <CelebrationOverlay />
      <DiscoveryOverlayHost />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.fog,
  },
});
