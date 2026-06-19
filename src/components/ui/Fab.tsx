import { type ReactNode } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  color: string;
  bottom: number;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  children: ReactNode;
}

/** 우하단 원형 액션 버튼 (위치·카메라 등). 배지는 children으로 넣는다. */
export default function Fab({
  color,
  bottom,
  onPress,
  disabled,
  accessibilityLabel,
  children,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: color, bottom }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      accessibilityLabel={accessibilityLabel}
    >
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
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});
