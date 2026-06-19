import { StyleSheet, Text } from 'react-native';

import { COLORS } from '../../constants/colors';

/** 비어있는 섹션 안내문 (muted). */
export default function EmptyHint({ children }: { children: string }) {
  return <Text style={styles.hint}>{children}</Text>;
}

const styles = StyleSheet.create({
  hint: { color: COLORS.muted, fontSize: 13, lineHeight: 19 },
});
