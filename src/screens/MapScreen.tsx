import {
  type ComponentRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Camera, MapView } from '@rnmapbox/maps';
import { Ionicons } from '@expo/vector-icons';

import FogLayer from '../components/map/FogLayer';
import LandmarkMarkers from '../components/map/LandmarkMarkers';
import LocationMarker from '../components/map/LocationMarker';
import PhotoMarkers from '../components/map/PhotoMarkers';
import Fab from '../components/ui/Fab';
import PhotoViewer from '../components/ui/PhotoViewer';
import { COLORS } from '../constants/colors';
import { CONFIG } from '../constants/config';
import { FONT } from '../constants/fonts';
import { getMapStyle } from '../constants/mapStyles';
import { useTracking } from '../hooks/useTracking';
import { capturePhotoAt } from '../services/photos';
import { getTileCount } from '../services/db';
import { useMapStore } from '../store/mapStore';
import { useSettingsStore } from '../store/settingsStore';
import { useUserStore } from '../store/userStore';
import type { Photo } from '../types';
import { coordToTile, tileAreaKm2 } from '../utils/h3';

// 첫 위치 픽스 전 기본 중심(서울 시청).
const DEFAULT_CENTER: [number, number] = [126.978, 37.5665];

export default function MapScreen() {
  const { status } = useTracking();
  const currentLocation = useMapStore((s) => s.currentLocation);
  const fogVersion = useMapStore((s) => s.fogVersion);
  const todayDistanceM = useUserStore((s) => s.todayDistanceM);
  const streak = useUserStore((s) => s.streak);
  const level = useUserStore((s) => s.level);
  const film = useUserStore((s) => s.film);
  const styleURL = getMapStyle(useSettingsStore((s) => s.mapStyleId)).styleURL;

  const [viewerPhotos, setViewerPhotos] = useState<Photo[]>([]);
  const [capturing, setCapturing] = useState(false);
  const [photoThumbs, setPhotoThumbs] = useState(true); // 줌 수준에 따라 썸네일/점

  const onCapture = useCallback(async () => {
    const loc = useMapStore.getState().currentLocation;
    if (!loc) {
      Alert.alert('위치 확인 중', '현재 위치를 찾는 중이에요. 잠시 후 다시 시도해주세요.');
      return;
    }
    setCapturing(true);
    const res = await capturePhotoAt(loc.lat, loc.lng);
    setCapturing(false);
    if (res === 'no-film') {
      Alert.alert('필름이 부족해요', '걸어서 필름을 모아야 사진을 남길 수 있어요. (가중 1km당 1장)');
    } else if (res === 'no-permission') {
      Alert.alert('카메라 권한 필요', '설정에서 카메라 접근을 허용해주세요.');
    } else if (res === 'error') {
      Alert.alert('오류', '사진 저장에 실패했어요.');
    }
  }, []);

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
        styleURL={styleURL}
        onDidFinishLoadingMap={handleMapLoaded}
        onCameraChanged={(e) => {
          const next = (e.properties?.zoom ?? 15) >= CONFIG.PHOTO_THUMB_MIN_ZOOM;
          setPhotoThumbs((prev) => (prev === next ? prev : next));
        }}
      >
        <Camera
          ref={cameraRef}
          defaultSettings={{ centerCoordinate: DEFAULT_CENTER, zoomLevel: 15 }}
        />
        <FogLayer />
        <LandmarkMarkers full={photoThumbs} />
        <PhotoMarkers thumbnails={photoThumbs} onSelect={setViewerPhotos} />
        <LocationMarker />
      </MapView>

      {/* 상단 탐험 통계 오버레이 */}
      <View style={styles.statCard} pointerEvents="none">
        <Text style={styles.statLabel}>내가 밝힌 땅</Text>
        <Text style={styles.statValue}>{areaKm2.toFixed(2)} km²</Text>
        <Text style={styles.statSub}>
          Lv {level} · 오늘 {(todayDistanceM / 1000).toFixed(1)}km · 🔥 {streak}일
        </Text>
      </View>

      {/* 사진 남기기 버튼 (필름 소모) */}
      <Fab
        color={COLORS.amber}
        bottom={174}
        onPress={onCapture}
        disabled={capturing}
        accessibilityLabel="사진 남기기"
      >
        {capturing ? (
          <ActivityIndicator color={COLORS.ink} />
        ) : (
          <Ionicons name="camera" size={24} color={COLORS.ink} />
        )}
        <View style={styles.filmBadge}>
          <Text style={styles.filmBadgeText}>🎞️{Math.floor(film)}</Text>
        </View>
      </Fab>

      {/* 내 위치로 이동 버튼 */}
      <Fab
        color={COLORS.lime}
        bottom={110}
        onPress={() => recenter(true)}
        accessibilityLabel="내 위치로 이동"
      >
        <Ionicons name="locate" size={24} color={COLORS.ink} />
      </Fab>

      {/* 사진 뷰어 (묶음 스와이프) */}
      <PhotoViewer photos={viewerPhotos} onClose={() => setViewerPhotos([])} />

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
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 2 },
  statValue: { color: COLORS.lime, fontSize: 22, fontFamily: FONT.display },
  statSub: { color: COLORS.text, fontSize: 12, marginTop: 4 },
  filmBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: COLORS.ink,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  filmBadgeText: { color: COLORS.amber, fontSize: 11, fontWeight: '700' },
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
