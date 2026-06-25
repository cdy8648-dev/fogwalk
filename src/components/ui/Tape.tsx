import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

interface Props {
  width?: number;
  height?: number;
  color?: string;
  rotate?: number;
  style?: StyleProp<ViewStyle>; // 위치 지정(position/top/alignSelf 등)
}

/** 워시테이프 한 조각 (폴라로이드·콜라주 카드 장식). 위치는 style로 넘긴다. */
export default function Tape({
  width = 56,
  height = 16,
  color = 'rgba(200,245,96,0.55)',
  rotate = -4,
  style,
}: Props) {
  return (
    <View
      style={[
        styles.tape,
        { width, height, backgroundColor: color, transform: [{ rotate: `${rotate}deg` }] },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  tape: { borderRadius: 2 },
});
