import { type ReactNode } from 'react';
import {
  type ImageSourcePropType,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface Props {
  bottom: number;
  onPress: () => void;
  color?: string; // 원형 배경색 (이미지 버튼이면 생략)
  image?: ImageSourcePropType; // 주면 일러스트 이미지 버튼(배경 원 없음)
  disabled?: boolean;
  accessibilityLabel?: string;
  children?: ReactNode; // 배지/스피너 등 위에 올릴 것
}

/** 우하단 액션 버튼. color=원형 버튼 / image=일러스트(폴라로이드·지도) 버튼. */
export default function Fab({
  bottom,
  onPress,
  color,
  image,
  disabled,
  accessibilityLabel,
  children,
}: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.fab,
        image ? styles.imageFab : { backgroundColor: color, borderRadius: 26 },
        { bottom },
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      accessibilityLabel={accessibilityLabel}
    >
      {image && <Image source={image} style={styles.image} resizeMode="contain" />}
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  // 일러스트 버튼은 원 배경 없이 조금 더 크게(아이콘 디테일이 살도록).
  imageFab: { width: 62, height: 62 },
  image: { width: '100%', height: '100%' },
});
