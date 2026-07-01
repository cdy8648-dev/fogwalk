import {
  type ComponentRef,
  useCallback,
  useEffect,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FogLayer from '../components/map/FogLayer';
import LandmarkMarkers from '../components/map/LandmarkMarkers';
import LocationMarker from '../components/map/LocationMarker';
import PhotoMarkers from '../components/map/PhotoMarkers';
import Fab from '../components/ui/Fab';
import PhotoViewer from '../components/ui/PhotoViewer';
import Tape from '../components/ui/Tape';
import { COLORS } from '../constants/colors';
import { CONFIG } from '../constants/config';
import { FONT } from '../constants/fonts';
import { getMapStyle } from '../constants/mapStyles';
import { useTracking } from '../hooks/useTracking';
import { capturePhotoAt } from '../services/photos';
import { useMapStore } from '../store/mapStore';
import { useSettingsStore } from '../store/settingsStore';
import { useUserStore } from '../store/userStore';
import type { Photo } from '../types';
import { abbrev } from '../utils/format';
import { fogClassAt } from '../utils/h3';

// 첫 위치 픽스 전 기본 중심(서울 시청).
const DEFAULT_CENTER: [number, number] = [126.978, 37.5665];

// 줌 → 마커 가시성. 임계값은 config(큰 값일수록 먼저 사라짐).
type MarkerVis = {
  thumbs: boolean; // 썸네일/이모지 핀 vs 점
  subway: boolean;
  common: boolean;
  photos: boolean;
  rare: boolean;
};
function visForZoom(zoom: number): MarkerVis {
  return {
    thumbs: zoom >= CONFIG.PHOTO_THUMB_MIN_ZOOM,
    subway: zoom >= CONFIG.SUBWAY_MIN_ZOOM,
    common: zoom >= CONFIG.LANDMARK_COMMON_MIN_ZOOM,
    photos: zoom >= CONFIG.PHOTO_MIN_ZOOM,
    rare: zoom >= CONFIG.LANDMARK_RARE_MIN_ZOOM,
  };
}
function sameVis(a: MarkerVis, b: MarkerVis): boolean {
  return (
    a.thumbs === b.thumbs &&
    a.subway === b.subway &&
    a.common === b.common &&
    a.photos === b.photos &&
    a.rare === b.rare
  );
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { status } = useTracking();
  const currentLocation = useMapStore((s) => s.currentLocation);
  const tiles = useMapStore((s) => s.visitedTileIds.size);
  const todayNewTiles = useUserStore((s) => s.todayNewTiles);
  const streak = useUserStore((s) => s.streak);
  const level = useUserStore((s) => s.level);
  const styleURL = getMapStyle(useSettingsStore((s) => s.mapStyleId)).styleURL;

  const [viewerPhotos, setViewerPhotos] = useState<Photo[]>([]);
  const [capturing, setCapturing] = useState(false);
  // 줌 수준에 따른 마커 가시성. 줌아웃하면 단계별로 사라져 결국 전설만 남는다.
  const [vis, setVis] = useState<MarkerVis>(() => visForZoom(15));

  const onCapture = useCallback(async () => {
    const loc = useMapStore.getState().currentLocation;
    if (!loc) {
      Alert.alert('위치 확인 중', '현재 위치를 찾는 중이에요. 잠시 후 다시 시도해주세요.');
      return;
    }
    setCapturing(true);
    const res = await capturePhotoAt(loc.lat, loc.lng);
    setCapturing(false);
    if (res === 'no-permission') {
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

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        styleURL={styleURL}
        scaleBarEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
        onDidFinishLoadingMap={handleMapLoaded}
        onLongPress={(e) => {
          const g = e.geometry;
          if (g.type !== 'Point') return;
          const [lng, lat] = g.coordinates;
          const cls = fogClassAt(lat, lng, useMapStore.getState().visitedTileIds);
          const msg =
            cls === 'land'
              ? '밝힌 땅이에요 🌿'
              : cls === 'near'
                ? '회색 안개예요 🌫️'
                : '검은 안개예요 🌑';
          Alert.alert('여기는', msg);
        }}
        onCameraChanged={(e) => {
          const next = visForZoom(e.properties?.zoom ?? 15);
          setVis((prev) => (sameVis(prev, next) ? prev : next));
        }}
      >
        <Camera
          ref={cameraRef}
          defaultSettings={{ centerCoordinate: DEFAULT_CENTER, zoomLevel: 15 }}
        />
        <FogLayer />
        <LandmarkMarkers
          full={vis.thumbs}
          showSubway={vis.subway}
          showCommon={vis.common}
          showRare={vis.rare}
        />
        <PhotoMarkers thumbnails={vis.thumbs} visible={vis.photos} onSelect={setViewerPhotos} />
        <LocationMarker />
      </MapView>

      {/* 상단 탐험 통계 오버레이 (폴라로이드 무드: 테잎 + 살짝 기울임) */}
      <View style={[styles.statCard, { top: insets.top + 6 }]} pointerEvents="none">
        <Tape width={58} height={18} color="rgba(200,245,96,0.5)" style={styles.statTapePos} />
        <Text style={styles.statLabel}>내가 밝힌 땅</Text>
        <Text style={styles.statValue}>{abbrev(tiles)} 칸</Text>
        <Text style={styles.statSub}>
          Lv {level} · 오늘 {abbrev(todayNewTiles)}칸 · 🔥 {streak}일
        </Text>
      </View>

      {/* 사진 남기기 버튼 (폴라로이드 일러스트) */}
      <Fab
        image={require('../../assets/fab-photo.png')}
        bottom={110}
        onPress={onCapture}
        disabled={capturing}
        accessibilityLabel="사진 남기기"
      >
        {capturing && <ActivityIndicator color={COLORS.ink} style={styles.fabSpinner} />}
      </Fab>

      {/* 내 위치로 이동 버튼 (지도 일러스트) */}
      <Fab
        image={require('../../assets/fab-location.png')}
        bottom={40}
        onPress={() => recenter(true)}
        accessibilityLabel="내 위치로 이동"
      />

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
  // 촬영 중 스피너 — 일러스트 위에 어둡게 깔아 가독성 확보.
  fabSpinner: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: 'rgba(13,15,26,0.5)',
  },
  statCard: {
    position: 'absolute',
    left: 16,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.violet,
    transform: [{ rotate: '-2.5deg' }],
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  statTapePos: { position: 'absolute', top: -9, alignSelf: 'center' },
  statLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 2 },
  statValue: { color: COLORS.lime, fontSize: 22, fontFamily: FONT.display },
  statSub: { color: COLORS.text, fontSize: 12, marginTop: 4 },
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
