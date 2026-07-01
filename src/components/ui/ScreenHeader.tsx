import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../../constants/colors';

// native-stack / bottom-tabs 헤더 props의 공통 최소 형태.
// (native-stack만 `back`을 준다 → 있으면 뒤로가기 표시)
interface Props {
  options: { title?: string };
  route: { name: string };
  navigation: { goBack: () => void };
  back?: { title?: string };
}

/**
 * Map을 제외한 모든 페이지가 공유하는 헤더. CollectionStack(네이티브 스택)과
 * Profile(탭)이 동일하게 `header`로 사용 → 렌더러 차이 없이 완전히 같은 모양.
 * iOS 스타일: 좌측 뒤로가기 셰브론 + 가운데 굵은 타이틀.
 */
export default function ScreenHeader({ options, route, navigation, back }: Props) {
  const insets = useSafeAreaInsets();
  const title = options.title ?? route.name;

  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        {back ? (
          <TouchableOpacity
            style={styles.side}
            onPress={navigation.goBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="뒤로"
          >
            <Ionicons name="chevron-back" size={26} color={COLORS.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.side} />
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.side} />
      </View>
    </View>
  );
}

const HEADER_HEIGHT = 48;

const styles = StyleSheet.create({
  wrap: { backgroundColor: COLORS.surface },
  bar: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  side: { width: 40, alignItems: 'center', justifyContent: 'center' },
  title: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
  },
});
