import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { COLORS } from '../constants/colors';
import ScreenHeader from '../components/ui/ScreenHeader';
import CollectionScreen from '../screens/CollectionScreen';
import BadgeDetailScreen from '../screens/BadgeDetailScreen';
import PassportDetailScreen from '../screens/PassportDetailScreen';
import CountryRegionsScreen from '../screens/CountryRegionsScreen';
import DiscoveryDetailScreen from '../screens/DiscoveryDetailScreen';

import type { DiscoveryGroup } from '../types';

// 발견 상세에서 처음 선택할 필터 (콜라주 타일 탭 시 전달). 4대분류 + 전체.
export type DiscoveryFilter = 'all' | DiscoveryGroup;

export type CollectionStackParamList = {
  CollectionHome: undefined;
  BadgeDetail: undefined;
  PassportDetail: undefined;
  CountryRegions: { code: string; name: string };
  DiscoveryDetail: { filter?: DiscoveryFilter } | undefined;
};

const Stack = createNativeStackNavigator<CollectionStackParamList>();

export default function CollectionStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <ScreenHeader {...props} />, // 모든 페이지 공용 헤더
        contentStyle: { backgroundColor: COLORS.fog },
      }}
    >
      <Stack.Screen
        name="CollectionHome"
        component={CollectionScreen}
        options={{ headerShown: false }} // 홈은 헤더 없이 (콘텐츠 자체 상단 여백)
      />
      <Stack.Screen
        name="BadgeDetail"
        component={BadgeDetailScreen}
        options={{ headerShown: false }} // 헤더 없음 — 탭 재탭·스와이프백으로 이동
      />
      <Stack.Screen
        name="PassportDetail"
        component={PassportDetailScreen}
        options={{ title: '여권' }}
      />
      <Stack.Screen
        name="CountryRegions"
        component={CountryRegionsScreen}
        options={{ headerShown: false }} // 아코디언 단일 페이지 — 탭바·스와이프백으로 이동
      />
      <Stack.Screen
        name="DiscoveryDetail"
        component={DiscoveryDetailScreen}
        options={{ title: '새로운 발견' }}
      />
    </Stack.Navigator>
  );
}
