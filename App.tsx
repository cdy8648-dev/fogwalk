import { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { DMMono_400Regular, DMMono_500Medium } from '@expo-google-fonts/dm-mono';
import Mapbox from '@rnmapbox/maps';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import CelebrationOverlay from './src/components/CelebrationOverlay';
import { COLORS } from './src/constants/colors';
import { hydrateCountry, refreshCountry } from './src/services/country';
import { initDatabase } from './src/services/db';
import { refreshProgressStore } from './src/services/progress';
import { useAchievementStore } from './src/store/achievementStore';
import { useLandmarkStore } from './src/store/landmarkStore';
import { useMapStore } from './src/store/mapStore';
import { usePhotoStore } from './src/store/photoStore';
import { useSettingsStore } from './src/store/settingsStore';
import MapScreen from './src/screens/MapScreen';
import CollectionStack from './src/navigation/CollectionStack';
import ProfileScreen from './src/screens/ProfileScreen';

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
  });

  useEffect(() => {
    initDatabase(); // DB 준비
    hydrateCountry(); // 마지막 국가 복원(즉시 적립 가능)
    useMapStore.getState().hydrate(); // DB → Set 복원
    useAchievementStore.getState().hydrate(); // DB → 해금 뱃지 복원(중복알림 방지)
    refreshProgressStore(); // DB → 진행도 복원 (뱃지 체크 포함)
    usePhotoStore.getState().hydrate(); // DB → 사진 복원
    useLandmarkStore.getState().hydrate(); // DB → 발견 랜드마크 복원
    useSettingsStore.getState().hydrate(); // DB → 설정(지도 스타일) 복원
    setReady(true);
  }, []);

  // 포그라운드 복귀 시, 백그라운드에서 쌓인 타일·진행도를 반영
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        useMapStore.getState().hydrate();
        refreshProgressStore();
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
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.surface },
            headerTintColor: COLORS.text,
            tabBarShowLabel: false,
            tabBarStyle: { backgroundColor: COLORS.surface, borderTopColor: COLORS.border },
            tabBarActiveTintColor: COLORS.lime,
            tabBarInactiveTintColor: COLORS.muted,
          }}
        >
          <Tab.Screen
            name="Map"
            component={MapScreen}
            options={{
              headerShown: false, // 풀블리드 지도 (카드는 safe-area 기준 오버레이)
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons name={focused ? 'map' : 'map-outline'} size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Collection"
            component={CollectionStack}
            options={{
              headerShown: false, // 스택이 헤더를 관리(상세 페이지 헤더와 중복 방지)
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons name={focused ? 'albums' : 'albums-outline'} size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? 'person-circle' : 'person-circle-outline'}
                  size={size}
                  color={color}
                />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      <CelebrationOverlay />
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
