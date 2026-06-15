import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants/colors';

interface ToastProps {
  message: string;
  visible?: boolean;
}

export default function Toast({ message, visible = true }: ToastProps) {
  if (!visible) return null;
  return (
    <View style={styles.toast}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.fogLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  message: {
    color: COLORS.text,
    fontSize: 14,
  },
});
