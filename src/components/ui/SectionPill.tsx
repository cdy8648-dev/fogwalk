import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../constants/colors';

interface Props {
  label: string;
  color: string;
  rotate?: number;
  hint?: string;
}

/** 회전된 네온 pill 섹션 라벨 (콜라주 핀보드용). */
export default function SectionPill({ label, color, rotate = 0, hint }: Props) {
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.pill,
          { backgroundColor: color, transform: [{ rotate: `${rotate}deg` }] },
        ]}
      >
        <Text style={styles.pillText}>{label}</Text>
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 11,
  },
  pill: { paddingHorizontal: 13, paddingVertical: 4, borderRadius: 999 },
  pillText: { color: COLORS.ink, fontWeight: '800', fontSize: 13 },
  hint: { color: COLORS.muted, fontSize: 11, letterSpacing: 1 },
});
