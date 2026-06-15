import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants/colors';

interface BadgeProps {
  label: string;
  color?: string;
}

export default function Badge({ label, color = COLORS.lime }: BadgeProps) {
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: COLORS.surface,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
