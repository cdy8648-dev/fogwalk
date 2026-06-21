import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';

import { COLORS } from '../constants/colors';
import { FONT } from '../constants/fonts';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const VERSION = Constants.expoConfig?.version ?? '1.0.0';

/** 정보 · 저작권(크레딧) 모달. 지도/데이터 출처 표기(약관·라이선스 준수). */
export default function AboutModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.appName}>FogWalk</Text>
          <Text style={styles.version}>v{VERSION}</Text>
          <Text style={styles.tagline}>걸으면 안개가 걷히는 탐험 기록</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>지도 · 데이터</Text>
          <Pressable onPress={() => Linking.openURL('https://www.mapbox.com/about/maps/')}>
            <Text style={styles.link}>© Mapbox</Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL('https://www.openstreetmap.org/copyright')}>
            <Text style={styles.link}>© OpenStreetMap contributors</Text>
          </Pressable>

          <Text style={styles.note}>
            랜드마크 정보는 OpenStreetMap에서 가져옵니다. 모든 탐험 기록은 기기에만 저장됩니다.
          </Text>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>닫기</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,6,12,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: 22,
  },
  appName: { color: COLORS.text, fontSize: 24, fontFamily: FONT.display },
  version: { color: COLORS.muted, fontSize: 12, fontFamily: FONT.mono, marginTop: 2 },
  tagline: { color: COLORS.muted, fontSize: 13, marginTop: 8 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 18 },
  sectionLabel: {
    color: COLORS.muted,
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: FONT.mono,
    marginBottom: 10,
  },
  link: { color: COLORS.lime, fontSize: 15, fontWeight: '600', paddingVertical: 6 },
  note: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: 12 },
  closeBtn: {
    marginTop: 20,
    backgroundColor: COLORS.lime,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeText: { color: COLORS.ink, fontSize: 15, fontWeight: '700' },
});
