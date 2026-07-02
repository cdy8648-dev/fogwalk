import {
  type ComponentRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Camera, MapView, PointAnnotation } from '@rnmapbox/maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, type ParamListBase } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import FogLayer from '../components/map/FogLayer';
import LandmarkMarkers from '../components/map/LandmarkMarkers';
import LocationMarker from '../components/map/LocationMarker';
import PhotoMarkers from '../components/map/PhotoMarkers';
import PhotoViewer from '../components/ui/PhotoViewer';
import Tape from '../components/ui/Tape';
import { COLORS } from '../constants/colors';
import { CONFIG } from '../constants/config';
import { FONT } from '../constants/fonts';
import { getMapStyle } from '../constants/mapStyles';
import { useTracking } from '../hooks/useTracking';
import { capturePhotoAt } from '../services/photos';
import { useMapStore } from '../store/mapStore';
import { useMapUiStore } from '../store/mapUiStore';
import { useSettingsStore } from '../store/settingsStore';
import { useUserStore } from '../store/userStore';
import type { Photo } from '../types';
import { abbrev } from '../utils/format';
import { clearFogWithInk } from '../services/ink';
import { coordToTile, enclosedFogAt, fogClassAt } from '../utils/h3';

// 첫 위치 픽스 전 기본 중심(서울 시청).
const DEFAULT_CENTER: [number, number] = [126.978, 37.5665];

/**
 * 연필 핀이 가리키는 대상. 안개 분류 + 잉크로 지울 타일 집합을 함께 담는다.
 * - land: 밝힌 땅 (지우기 없음 — 라벨은 다음 단계)
 * - gray: 회색 안개 → 그 칸 1개, 어디서나 가능
 * - hole: 검은 안개인데 밝힌 땅으로 둘러싸인 '구멍' → 통째로 (땅따먹기)
 * - blocked: 검은 안개인데 열려 있거나 너무 넓음 → 지우기 불가
 */
type PencilTarget =
  | { kind: 'land' }
  | { kind: 'gray'; tiles: [string] }
  | { kind: 'hole'; tiles: string[] }
  | { kind: 'blocked' };

function targetMessage(t: PencilTarget): string {
  if (t.kind === 'land') return '밝힌 땅이에요 🌿';
  if (t.kind === 'gray') return '회색 안개예요 🌫️';
  if (t.kind === 'hole') return `검은 안개예요 🌑 · ${t.tiles.length}칸 포위!`;
  return '검은 안개예요 🌑';
}

/** 잉크 비용. 지울 수 없는 대상은 null. */
function targetCost(t: PencilTarget): number | null {
  if (t.kind === 'gray') return CONFIG.INK_COST_GRAY;
  if (t.kind === 'hole') return t.tiles.length * CONFIG.INK_COST_BLACK;
  return null;
}

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
  const navigation = useNavigation<BottomTabNavigationProp<ParamListBase>>();
  const { status } = useTracking();
  // 주의: 원시 위치·소수 잉크를 그대로 구독하면 GPS 픽스마다 화면 전체가 재렌더된다.
  // 위치는 유무(boolean)만, 잉크는 정수부만 구독 (위치 자체는 LocationMarker가 구독).
  const hasLocation = useMapStore((s) => s.currentLocation != null);
  const tiles = useMapStore((s) => s.visitedTileIds.size);
  const todayNewTiles = useUserStore((s) => s.todayNewTiles);
  const streak = useUserStore((s) => s.streak);
  const level = useUserStore((s) => s.level);
  const ink = useUserStore((s) => Math.floor(s.ink)); // 정수 비용과 floor(x)≥c ⟺ x≥c 로 판정 동일
  const styleURL = getMapStyle(useSettingsStore((s) => s.mapStyleId)).styleURL;

  const [viewerPhotos, setViewerPhotos] = useState<Photo[]>([]);
  // 롱프레스로 찍는 연필 핀 좌표([lng, lat]) + 그 위치의 대상 판별(팝업용). 드래그로 이동.
  const [pinCoord, setPinCoord] = useState<[number, number] | null>(null);
  const [pinTarget, setPinTarget] = useState<PencilTarget | null>(null);
  // 줌 수준에 따른 마커 가시성. 줌아웃하면 단계별로 사라져 결국 전설만 남는다.
  const [vis, setVis] = useState<MarkerVis>(() => visForZoom(15));

  const onCapture = useCallback(async () => {
    const loc = useMapStore.getState().currentLocation;
    if (!loc) {
      Alert.alert('위치 확인 중', '현재 위치를 찾는 중이에요. 잠시 후 다시 시도해주세요.');
      return;
    }
    useMapUiStore.getState().setCapturing(true);
    const res = await capturePhotoAt(loc.lat, loc.lng);
    useMapUiStore.getState().setCapturing(false);
    if (res === 'no-permission') {
      Alert.alert('카메라 권한 필요', '설정에서 카메라 접근을 허용해주세요.');
    } else if (res === 'error') {
      Alert.alert('오류', '사진 저장에 실패했어요.');
    }
  }, []);

  // 연필 핀 배치/이동 시 대상 판별(분류 + 지울 타일 계산) 후 팝업 표시.
  const showPencil = useCallback((lng: number, lat: number) => {
    setPinCoord([lng, lat]);
    const visited = useMapStore.getState().visitedTileIds;
    const cls = fogClassAt(lat, lng, visited);
    if (cls === 'land') {
      setPinTarget({ kind: 'land' });
    } else if (cls === 'near') {
      setPinTarget({ kind: 'gray', tiles: [coordToTile(lat, lng)] });
    } else {
      // 검은 안개: 밝힌 땅으로 둘러싸인 구멍인지 flood-fill 판별 (상한 초과 = 열림/너무 큼)
      const hole = enclosedFogAt(lat, lng, visited, CONFIG.INK_HOLE_MAX_TILES);
      setPinTarget(hole ? { kind: 'hole', tiles: hole } : { kind: 'blocked' });
    }
  }, []);
  const removePencil = useCallback(() => {
    setPinCoord(null);
    setPinTarget(null);
  }, []);

  // 팝업의 [잉크로 밝히기] 확정 — 차감 + reveal + 연필 제거.
  const clearWithInk = useCallback(() => {
    const t = pinTarget;
    if (!t || (t.kind !== 'gray' && t.kind !== 'hole')) return;
    const cost = targetCost(t);
    if (cost == null) return;
    const res = clearFogWithInk(t.tiles, cost);
    if (res === 'no-ink') {
      Alert.alert('잉크 부족', '더 걸어서 잉크를 모아보세요 🚶');
      return;
    }
    removePencil();
  }, [pinTarget, removePencil]);

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
    if (hasLocation && !didAutoCenter.current && cameraRef.current) {
      recenter(false);
      didAutoCenter.current = true;
    }
  }, [hasLocation, recenter]);

  // 위치가 이미 있는데 지도가 늦게 뜬 경우 보강.
  const handleMapLoaded = useCallback(() => {
    if (!didAutoCenter.current && useMapStore.getState().currentLocation) {
      recenter(false);
      didAutoCenter.current = true;
    }
  }, [recenter]);

  // 탭바 카메라 버튼이 호출할 촬영 액션 등록.
  useEffect(() => {
    useMapUiStore.getState().setCapture(onCapture);
  }, [onCapture]);

  // 이미 활성인 Map 탭을 한 번 더 누르면 내 위치로 이동.
  useEffect(() => {
    const unsub = navigation.addListener('tabPress', () => {
      if (navigation.isFocused()) recenter(true);
    });
    return unsub;
  }, [navigation, recenter]);

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
          showPencil(lng, lat); // 연필 핀 표시 + 분류 팝업
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
        {/* 롱프레스 지점 연필 핀 — 드래그로 위치 조정 (팁이 정확한 좌표를 가리킴) */}
        {pinCoord && (
          <PointAnnotation
            key={`pencil-${pinCoord[0]},${pinCoord[1]}`} // 좌표 변경 시 확실히 이동(iOS 갱신 이슈 회피)
            id="pencil-pin"
            coordinate={pinCoord}
            anchor={{ x: 0.16, y: 0.9 }}
            draggable
            onDragEnd={(payload) => {
              const c = payload.geometry.coordinates;
              showPencil(c[0], c[1]); // 드래그해 놓으면 그 위치 분류 팝업
            }}
          >
            <Image
              source={require('../../assets/pencil.png')}
              style={styles.pencil}
              resizeMode="contain"
            />
          </PointAnnotation>
        )}
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

      {/* 우상단 잉크 잔량 HUD (걸어서 모아 지도를 칠하는 통화) */}
      <TouchableOpacity
        style={[styles.inkHud, { top: insets.top + 6 }]}
        activeOpacity={0.85}
        onPress={() =>
          Alert.alert(
            '잉크',
            `보유 잉크 ${ink}\n\n걸을수록 잉크가 모여요. 곧 잉크로 지도를 칠할 수 있어요 🖌️`
          )
        }
        accessibilityLabel={`잉크 ${ink}`}
      >
        <Image source={require('../../assets/ink.png')} style={styles.inkIcon} resizeMode="contain" />
        <View style={styles.inkBadge}>
          <Text style={styles.inkBadgeText}>{abbrev(ink)}</Text>
        </View>
      </TouchableOpacity>

      {/* 연필 핀 팝업: 판별 + (가능하면) 잉크로 밝히기. 드래그로 이동 시 갱신, X로 연필 제거 */}
      {pinTarget &&
        (() => {
          const cost = targetCost(pinTarget);
          const canAfford = cost != null && ink >= cost;
          const n = pinTarget.kind === 'gray' || pinTarget.kind === 'hole' ? pinTarget.tiles.length : 0;
          return (
            <View
              style={[styles.pinPopupWrap, { bottom: insets.bottom + 96 }]}
              pointerEvents="box-none"
            >
              <View style={styles.pinPopup}>
                <View style={styles.pinPopupRow}>
                  <Text style={styles.pinPopupText}>{targetMessage(pinTarget)}</Text>
                  <TouchableOpacity
                    onPress={removePencil}
                    style={styles.pinPopupClose}
                    hitSlop={8}
                    accessibilityLabel="연필 제거"
                  >
                    <Text style={styles.pinPopupCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {pinTarget.kind === 'blocked' && (
                  <Text style={styles.pinPopupSub}>
                    밝힌 땅으로 완전히 둘러싼 곳만 지울 수 있어요 (너무 넓어도 안 돼요)
                  </Text>
                )}

                {cost != null && (
                  <TouchableOpacity
                    onPress={clearWithInk}
                    disabled={!canAfford}
                    activeOpacity={0.85}
                    style={[styles.pinAction, !canAfford && styles.pinActionDisabled]}
                    accessibilityLabel={`잉크 ${cost}로 ${n}칸 밝히기`}
                  >
                    <Text style={[styles.pinActionText, !canAfford && styles.pinActionTextDisabled]}>
                      {canAfford
                        ? `🖌️ 잉크 ${cost}로 ${n}칸 밝히기`
                        : `잉크 부족 · ${cost} 필요 (보유 ${ink})`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })()}

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
  pencil: { width: 44, height: 44 },
  inkHud: { position: 'absolute', right: 16, width: 48, height: 48 },
  inkIcon: { width: 48, height: 48 },
  inkBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 5,
    backgroundColor: COLORS.lime,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inkBadgeText: { color: COLORS.ink, fontSize: 12, fontFamily: FONT.display },
  // 연필 핀 안내 팝업 (하단 중앙, 탭바 위)
  pinPopupWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  pinPopup: {
    maxWidth: 320,
    paddingLeft: 18,
    paddingRight: 10,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  pinPopupRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pinPopupText: { color: COLORS.text, fontSize: 15, fontWeight: '700', flexShrink: 1 },
  pinPopupSub: { color: COLORS.muted, fontSize: 12, marginTop: 8, marginRight: 8 },
  pinAction: {
    marginTop: 10,
    marginRight: 8,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.lime,
    alignItems: 'center',
  },
  pinActionDisabled: { backgroundColor: COLORS.fogLight },
  pinActionText: { color: COLORS.ink, fontSize: 14, fontWeight: '800' },
  pinActionTextDisabled: { color: COLORS.muted },
  pinPopupClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.fogLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinPopupCloseText: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
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
