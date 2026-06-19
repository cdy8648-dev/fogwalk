import { StyleSheet, Text } from 'react-native';

import { COLORS } from '../../constants/colors';

/** 섹션 제목 (뱃지/여권/랜드마크/사진 등). */
export default function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.title}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 12,
  },
});
