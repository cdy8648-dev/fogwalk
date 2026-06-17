import { type ComponentRef, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Mapbox, { Camera, MapView } from '@rnmapbox/maps';
import { Ionicons } from '@expo/vector-icons';

import FogLayer from '../components/map/FogLayer';
import LocationMarker from '../components/map/LocationMarker';
import { COLORS } from '../constants/colors';
import { useTracking } from '../hooks/useTracking';
import { getTileCount } from '../services/db';
import { useMapStore } from '../store/mapStore';
import { coordToTile, tileAreaKm2 } from '../utils/h3';

// 첫 위치 픽스 전 기본 중심(서울 시청).
const DEFAULT_CENTER: [number, number] = [126.978, 37.5665];

// 지도 스타일. 밝은 베이스라 밝혀진 영역이 어두운 안개와 대비된다.
// 대안: Mapbox.StyleURL.Light(미니멀 회백), .Dark(어두움),
//       또는 Mapbox Studio 커스텀 스타일 URL 문자열('mapbox://styles/<user>/<id>')
const MAP_STYLE = Mapbox.StyleURL.Street;

export default function MapScreen() {
  const { status } = useTracking();
  const currentLocation = useMapStore((s) => s.currentLocation);
  const fogVersion = useMapStore((s) => s.fogVersion);

  const cameraRef = useRef<ComponentRef<typeof Camera>>(null);
  const didAutoCenter = useRef(false);

  // 스토어에서 최신 위치를 읽어 카메라 이동(스테일 클로저 방지).
  const recenter = useCallback((animated: boolean) => {
    const loc = useMapStore.getState().currentLocation;
    if (loc && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [loc.lng, loc.lat],
        zoomLevel: 15,
        animationDuration: animated ? 500 : 0,
      });
    }
  }, []);

  // 첫 위치 픽스 시 1회 자동 센터. (cameraRef가 준비됐을 때만 완료 처리 → 레이스 방지)
  useEffect(() => {
    if (currentLocation && !didAutoCenter.current && cameraRef.current) {
      recenter(false);
      didAutoCenter.current = true;
    }
  }, [currentLocation, recenter]);

  // 위치가 이미 있는데 지도가 늦게 뜬 경우 보강.
  const handleMapLoaded = useCallback(() => {
    if (!didAutoCenter.current && useMapStore.getState().currentLocation) {
      recenter(false);
      didAutoCenter.current = true;
    }
  }, [recenter]);

  // 밝힌 면적 = 타일 수 × 타일당 면적. fogVersion 변경 시 갱신.
  const areaKm2 = useMemo(() => {
    const count = getTileCount();
    if (count === 0) return 0;
    const sampleLat = currentLocation?.lat ?? DEFAULT_CENTER[1];
    const sampleLng = currentLocation?.lng ?? DEFAULT_CENTER[0];
    return count * tileAreaKm2(coordToTile(sampleLat, sampleLng));
  }, [fogVersion, currentLocation]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        styleURL={MAP_STYLE}
        onDidFinishLoadingMap={handleMapLoaded}
      >
        <Camera
          ref={cameraRef}
          defaultSettings={{ centerCoordinate: DEFAULT_CENTER, zoomLevel: 15 }}
        />
        <FogLayer />
        <LocationMarker />
      </MapView>

      {/* 상단 탐험 통계 오버레이 */}
      <View style={styles.statCard} pointerEvents="none">
        <Text style={styles.statLabel}>내가 밝힌 땅</Text>
        <Text style={styles.statValue}>{areaKm2.toFixed(2)} km²</Text>
      </View>

      {/* 내 위치로 이동 버튼 */}
      <TouchableOpacity
        style={styles.locateButton}
        onPress={() => recenter(true)}
        activeOpacity={0.85}
        accessibilityLabel="내 위치로 이동"
      >
        <Ionicons name="locate" size={24} color={COLORS.ink} />
      </TouchableOpacity>

      {/* 위치 권한 거부 안내 */}
      {status === 'denied' && (
        <View style={styles.deniedWrap}>
          <View style={styles.deniedCard}>
            <Text style={styles.deniedTitle}>위치 권한이 필요해요</Text>
            <Text style={styles.deniedDesc}>
              걸으면서 안개를 걷으려면 위치 접근을 허용해야 합니다.
            </Text>
            <TouchableOpacity
              style={styles.deniedButton}
              onPress={() => Linking.openSettings()}
            >
              <Text style={styles.deniedButtonText}>설정 열기</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.fog },
  map: { flex: 1 },
  statCard: {
    position: 'absolute',
    top: 56,
    left: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 2 },
  statValue: { color: COLORS.lime, fontSize: 20, fontWeight: '700' },
  locateButton: {
    position: 'absolute',
    right: 16,
    bottom: 110,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.lime,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  deniedWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  deniedCard: {
    width: '100%',
    maxWidth: 360,
    padding: 20,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  deniedTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  deniedDesc: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  deniedButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.lime,
  },
  deniedButtonText: { color: COLORS.ink, fontSize: 15, fontWeight: '700' },
});
