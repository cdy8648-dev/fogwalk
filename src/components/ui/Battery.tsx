import { StyleSheet, View } from 'react-native';

import { COLORS } from '../../constants/colors';

const CELLS = 10;

/**
 * 배터리 잔량 스타일 진행률 게이지. 10칸 세그먼트 + 오른쪽 단자(+극).
 * ratio 0~1 → 채워진 칸 수(값이 있으면 최소 1칸은 보이게).
 */
export default function Battery({ ratio }: { ratio: number }) {
  const filled =
    ratio <= 0 ? 0 : Math.max(1, Math.min(CELLS, Math.round(ratio * CELLS)));
  return (
    <View style={styles.wrap}>
      <View style={styles.body}>
        {Array.from({ length: CELLS }, (_, i) => (
          <View key={i} style={[styles.cell, i < filled ? styles.cellOn : styles.cellOff]} />
        ))}
      </View>
      <View style={styles.cap} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center' },
  body: {
    flexDirection: 'row',
    gap: 2,
    padding: 3,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.fogLight,
  },
  cell: { width: 5, height: 12, borderRadius: 2 },
  cellOn: { backgroundColor: COLORS.lime },
  cellOff: { backgroundColor: 'rgba(255,255,255,0.08)' },
  cap: {
    width: 2.5,
    height: 7,
    marginLeft: 1.5,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    backgroundColor: COLORS.border,
  },
});
