import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

import { COLORS } from '../../constants/colors';
import { POPUP_COLORS } from '../../constants/popup';

interface Props {
  children: ReactNode;
  radius?: number;
  borderColor?: string;
  shadow?: boolean; // 지도 위 팝업은 그림자로 띄움
  style?: StyleProp<ViewStyle>; // 여백·폭 등 (클립 레이어에 적용)
}

/**
 * 글래스모피즘 팝업 컨테이너 — BlurView + 반투명 틴트 + 네온 테두리.
 * 2겹: 바깥(그림자, overflow visible) + 안(블러 클립, overflow hidden).
 * iOS는 overflow:hidden 뷰에 그림자가 안 나오므로 그림자를 바깥 레이어로 분리한다.
 */
export default function GlassPanel({
  children,
  radius = 20,
  borderColor = COLORS.violet,
  shadow = true,
  style,
}: Props) {
  return (
    <View style={[{ borderRadius: radius }, shadow && styles.shadow]}>
      <View style={[styles.clip, { borderRadius: radius, borderColor }, style]}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.tint]} pointerEvents="none" />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    backgroundColor: 'rgba(13,15,26,0.5)', // iOS 그림자 형태용(과하면 글래스 투명감 죽음)
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 16 },
  },
  clip: {
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: 'rgba(13,15,26,0.35)', // 블러 미지원 폴백
  },
  tint: { backgroundColor: POPUP_COLORS.glassTint },
});
