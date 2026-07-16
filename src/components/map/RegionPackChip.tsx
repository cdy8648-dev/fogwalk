import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '../../constants/colors';
import { downloadPack } from '../../services/regionPackDownload';
import { useRegionPackStore } from '../../store/regionPackStore';

/**
 * 대형 해외 지역팩 보류 칩 — 로밍 데이터 폭탄 방어용.
 * 소형 팩은 무음 자동 다운로드라 이 칩이 안 뜬다. 대국(미국·중국 등)만 사용자 탭 유도.
 */
export default function RegionPackChip() {
  const insets = useSafeAreaInsets();
  const pending = useRegionPackStore((s) => s.pending);
  const downloading = useRegionPackStore((s) => s.downloading);

  if (!pending) return null;
  const busy = downloading === pending.cc;
  const mb = (pending.bytes / 1024 / 1024).toFixed(1);

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + 96 }]} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.chip}
        activeOpacity={0.85}
        disabled={busy}
        onPress={() => void downloadPack(pending.cc)}
        accessibilityLabel={`${pending.name} 지역 데이터 받기`}
      >
        {busy ? (
          <ActivityIndicator size="small" color={COLORS.ink} />
        ) : (
          <Text style={styles.globe}>🌏</Text>
        )}
        <View>
          <Text style={styles.title}>
            {busy ? `${pending.name} 지역 데이터 받는 중…` : `${pending.name} 지역 달성률 켜기`}
          </Text>
          {!busy && (
            <Text style={styles.sub}>{mb}MB · WiFi 권장 · 탭하면 다운로드</Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.lime,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  globe: { fontSize: 20 },
  title: { color: COLORS.ink, fontSize: 13, fontWeight: '800' },
  sub: { color: 'rgba(13,15,26,0.7)', fontSize: 11, marginTop: 1 },
});
