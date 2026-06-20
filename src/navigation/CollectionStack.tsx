import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { COLORS } from '../constants/colors';
import CollectionScreen from '../screens/CollectionScreen';
import BadgeDetailScreen from '../screens/BadgeDetailScreen';
import PassportDetailScreen from '../screens/PassportDetailScreen';
import DiscoveryDetailScreen from '../screens/DiscoveryDetailScreen';

// 발견 상세에서 처음 선택할 카테고리 필터 (콜라주 타일 탭 시 전달).
export type DiscoveryFilter = 'all' | 'park' | 'landmark' | 'peak' | 'subway';

export type CollectionStackParamList = {
  CollectionHome: undefined;
  BadgeDetail: undefined;
  PassportDetail: undefined;
  DiscoveryDetail: { filter?: DiscoveryFilter } | undefined;
};

const Stack = createNativeStackNavigator<CollectionStackParamList>();

export default function CollectionStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '800' },
        contentStyle: { backgroundColor: COLORS.fog },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="CollectionHome"
        component={CollectionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="BadgeDetail" component={BadgeDetailScreen} options={{ title: '뱃지' }} />
      <Stack.Screen
        name="PassportDetail"
        component={PassportDetailScreen}
        options={{ title: '여권' }}
      />
      <Stack.Screen
        name="DiscoveryDetail"
        component={DiscoveryDetailScreen}
        options={{ title: '새로운 발견' }}
      />
    </Stack.Navigator>
  );
}
