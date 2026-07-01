import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { COLORS } from '../constants/colors';
import ScreenHeader from '../components/ui/ScreenHeader';
import CollectionScreen from '../screens/CollectionScreen';
import BadgeDetailScreen from '../screens/BadgeDetailScreen';
import PassportDetailScreen from '../screens/PassportDetailScreen';
import CountryRegionsScreen from '../screens/CountryRegionsScreen';
import DiscoveryDetailScreen from '../screens/DiscoveryDetailScreen';

// 발견 상세에서 처음 선택할 카테고리 필터 (콜라주 타일 탭 시 전달).
export type DiscoveryFilter = 'all' | 'park' | 'landmark' | 'peak' | 'subway';

export type CollectionStackParamList = {
  CollectionHome: undefined;
  BadgeDetail: undefined;
  PassportDetail: undefined;
  CountryRegions: { code: string; name: string; region?: string };
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
        options={{ title: 'Collection' }}
      />
      <Stack.Screen name="BadgeDetail" component={BadgeDetailScreen} options={{ title: '뱃지' }} />
      <Stack.Screen
        name="PassportDetail"
        component={PassportDetailScreen}
        options={{ title: '여권' }}
      />
      <Stack.Screen
        name="CountryRegions"
        component={CountryRegionsScreen}
        options={{ title: '권역별' }}
      />
      <Stack.Screen
        name="DiscoveryDetail"
        component={DiscoveryDetailScreen}
        options={{ title: '새로운 발견' }}
      />
    </Stack.Navigator>
  );
}
