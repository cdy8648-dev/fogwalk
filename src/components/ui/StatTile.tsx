import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants/colors';
import { FONT } from '../../constants/fonts';

interface Props {
  value: string;
  label: string;
}

/** 큰 숫자 + 작은 라벨 통계 타일. */
export default function StatTile({ value, label }: Props) {
  return (
    <View style={styles.tile}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 16,
    alignItems: 'center',
  },
  value: { color: COLORS.lime, fontSize: 22, fontFamily: FONT.display },
  label: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
});
