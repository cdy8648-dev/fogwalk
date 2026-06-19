import { StyleSheet, View, type ViewProps } from 'react-native';

import { COLORS } from '../../constants/colors';

/** 표준 카드: surface + 테두리 + 둥근 모서리 + 패딩. */
export default function Card({ style, children, ...rest }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
});
