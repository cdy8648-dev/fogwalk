import { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import Mapbox from '@rnmapbox/maps';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import CelebrationOverlay from './src/components/CelebrationOverlay';
import { COLORS } from './src/constants/colors';
import { initDatabase } from './src/services/db';
import { refreshProgressStore } from './src/services/progress';
import { useAchievementStore } from './src/store/achievementStore';
import { useMapStore } from './src/store/mapStore';
import { usePhotoStore } from './src/store/photoStore';
import { useSettingsStore } from './src/store/settingsStore';
import MapScreen from './src/screens/MapScreen';
import CollectionScreen from './src/screens/CollectionScreen';
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

  useEffect(() => {
    initDatabase(); // DB 준비
    useMapStore.getState().hydrate(); // DB → Set 복원
    useAchievementStore.getState().hydrate(); // DB → 해금 뱃지 복원(중복알림 방지)
    refreshProgressStore(); // DB → 진행도 복원 (뱃지 체크 포함)
    usePhotoStore.getState().hydrate(); // DB → 사진 복원
    useSettingsStore.getState().hydrate(); // DB → 설정(지도 스타일) 복원
    setReady(true);
  }, []);

  // 포그라운드 복귀 시, 백그라운드에서 쌓인 타일·진행도를 반영
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        useMapStore.getState().hydrate();
        refreshProgressStore();
      }
    });
    return () => sub.remove();
  }, []);

  if (!ready) {
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
            tabBarStyle: { backgroundColor: COLORS.surface, borderTopColor: COLORS.border },
            tabBarActiveTintColor: COLORS.lime,
            tabBarInactiveTintColor: COLORS.muted,
          }}
        >
          <Tab.Screen name="Map" component={MapScreen} />
          <Tab.Screen name="Collection" component={CollectionScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
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
