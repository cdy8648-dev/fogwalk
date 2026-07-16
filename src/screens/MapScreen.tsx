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
  useWindowDimensions,
  View,
} from 'react-native';
import { Camera, MapView, PointAnnotation } from '@rnmapbox/maps';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, type ParamListBase } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import FogLayer from '../components/map/FogLayer';
import LandmarkMarkers from '../components/map/LandmarkMarkers';
import LocationMarker from '../components/map/LocationMarker';
import PhotoMarkers from '../components/map/PhotoMarkers';
import PlaceMarkers from '../components/map/PlaceMarkers';
import PlaceFloatingCard from '../components/place/PlaceFloatingCard';
import PlaceEditorSheet from '../components/place/PlaceEditorSheet';
import { PlaceIcon } from '../components/place/PlaceIcon';
import RegionPackChip from '../components/map/RegionPackChip';
import PhotoViewer from '../components/ui/PhotoViewer';
import Tape from '../components/ui/Tape';
import { COLORS } from '../constants/colors';
import { CONFIG } from '../constants/config';
import { FONT } from '../constants/fonts';
import { getMapStyle } from '../constants/mapStyles';
import { useTracking } from '../hooks/useTracking';
import { capturePhotoAt } from '../services/photos';
import { createPlace, movePlace, updatePlaceInfo, type PlaceDraft } from '../services/places';
import { useMapStore } from '../store/mapStore';
import { useMapUiStore } from '../store/mapUiStore';
import { useRecapStore } from '../store/recapStore';
import { useSettingsStore } from '../store/settingsStore';
import { useUserStore } from '../store/userStore';
import type { Photo, Place } from '../types';
import { abbrev } from '../utils/format';
import { clearFogWithInk } from '../services/ink';
import { fogClassAt, grayRegionAt, tileCenterCoord } from '../utils/h3';

// 첫 위치 픽스 전 기본 중심(서울 시청).
const DEFAULT_CENTER: [number, number] = [126.978, 37.5665];

/**
 * 연필 핀이 가리키는 대상.
 * - land: 밝힌 땅 (지우기 없음 — 라벨은 다음 단계)
 * - gray: 회색 안개 → 잉크로 밝힘. tiles = 연결된 회색 영역(가까운 순, 상한 컷), [0]=핀 칸.
 *   truncated = 상한에 잘림(실제 영역은 더 큼)
 * - blocked: 검은 안개 → 잉크로 못 밝힘. 회색을 밝히면 그 주변 검은 안개가 회색으로 걷힘
 */
type PencilTarget =
  | { kind: 'land' }
  | { kind: 'gray'; tiles: string[]; truncated: boolean }
  | { kind: 'blocked' };

function targetMessage(t: PencilTarget): string {
  if (t.kind === 'land') return '밝힌 땅이에요 🌿';
  if (t.kind === 'gray')
    return `회색 안개예요 🌫️ · 연결 ${t.tiles.length}${t.truncated ? '+' : ''}칸`;
  return '검은 안개예요 🌑';
}

// 줌 → 마커 가시성. 임계값은 config(큰 값일수록 먼저 사라짐).
type MarkerVis = {
  thumbs: boolean; // 썸네일/이모지 핀 vs 점
  subway: boolean;
  common: boolean;
  photos: boolean;
  rare: boolean;
  epic: boolean;
};
function visForZoom(zoom: number): MarkerVis {
  return {
    thumbs: zoom >= CONFIG.PHOTO_THUMB_MIN_ZOOM,
    subway: zoom >= CONFIG.SUBWAY_MIN_ZOOM,
    common: zoom >= CONFIG.LANDMARK_COMMON_MIN_ZOOM,
    photos: zoom >= CONFIG.PHOTO_MIN_ZOOM,
    rare: zoom >= CONFIG.LANDMARK_RARE_MIN_ZOOM,
    epic: zoom >= CONFIG.LANDMARK_EPIC_MIN_ZOOM,
  };
}
function sameVis(a: MarkerVis, b: MarkerVis): boolean {
  return (
    a.thumbs === b.thumbs &&
    a.subway === b.subway &&
    a.common === b.common &&
    a.photos === b.photos &&
    a.rare === b.rare &&
    a.epic === b.epic
  );
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();
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
  // 탐험 일지(별자리 리캡) — 도착 시 편지함에 뱃지, 탭하면 재생
  const recapReady = useRecapStore((s) => s.data != null);
  const playRecap = useRecapStore((s) => s.play);
  const styleURL = getMapStyle(useSettingsStore((s) => s.mapStyleId)).styleURL;

  const [viewerPhotos, setViewerPhotos] = useState<Photo[]>([]);
  // 우상단 햄버거 메뉴 (잉크·편지함 수납)
  const [menuOpen, setMenuOpen] = useState(false);
  // 롱프레스로 찍는 연필 핀 좌표([lng, lat]) + 그 위치의 대상 판별(팝업용). 드래그로 이동.
  const [pinCoord, setPinCoord] = useState<[number, number] | null>(null);
  const [pinTarget, setPinTarget] = useState<PencilTarget | null>(null);
  // 나만의 장소: 생성 좌표([lng,lat]) / 수정 대상 / 상세 카드 / 위치 이동 모드(+드래그 좌표)
  const [placeCoord, setPlaceCoord] = useState<[number, number] | null>(null);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [movingPlace, setMovingPlace] = useState<Place | null>(null);
  const [moveCoord, setMoveCoord] = useState<[number, number] | null>(null);
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
  // 핀은 육각타일 중심으로 스냅 — 어느 칸을 가리키는지 명확하게.
  const showPencil = useCallback((lng: number, lat: number) => {
    setSelectedPlace(null); // 연필과 장소 카드 상호배제 (겹침 방지)
    setPinCoord(tileCenterCoord(lat, lng));
    const visited = useMapStore.getState().visitedTileIds;
    const cls = fogClassAt(lat, lng, visited);
    if (cls === 'land') {
      setPinTarget({ kind: 'land' });
    } else if (cls === 'near') {
      // 연결된 회색 영역을 상한+1까지 수집 → 상한 초과분이 있으면 잘림 표시
      const region = grayRegionAt(lat, lng, visited, CONFIG.INK_BULK_MAX_TILES + 1);
      const truncated = region.length > CONFIG.INK_BULK_MAX_TILES;
      setPinTarget({
        kind: 'gray',
        tiles: truncated ? region.slice(0, CONFIG.INK_BULK_MAX_TILES) : region,
        truncated,
      });
    } else {
      setPinTarget({ kind: 'blocked' }); // 검은 안개는 잉크로 못 밝힘
    }
  }, []);
  const removePencil = useCallback(() => {
    setPinCoord(null);
    setPinTarget(null);
  }, []);

  // 팝업의 [잉크로 밝히기] 확정 — 차감 + reveal + 연필 제거. tiles = 밝힐 칸(1칸 or 일괄).
  const clearWithInk = useCallback(
    (tiles: string[]) => {
      const res = clearFogWithInk(tiles, tiles.length * CONFIG.INK_COST_GRAY);
      if (res === 'no-ink') {
        Alert.alert('잉크 부족', '더 걸어서 잉크를 모아보세요 🚶');
        return;
      }
      removePencil();
    },
    [removePencil]
  );

  // 나만의 장소 저장 — 생성(잉크 차감·주소 자동)과 수정(무료) 분기
  const savePlace = useCallback(
    async (draft: PlaceDraft) => {
      if (editingPlace) {
        const next = updatePlaceInfo(editingPlace, draft);
        setEditingPlace(null);
        if (next) setSelectedPlace(next);
        else Alert.alert('오류', '장소 저장에 실패했어요.');
        return;
      }
      if (!placeCoord) return;
      const [lng, lat] = placeCoord;
      setPlaceCoord(null);
      const res = await createPlace(lat, lng, draft);
      if (res === 'no-ink') Alert.alert('잉크 부족', '더 걸어서 잉크를 모아보세요 🚶');
      else if (res === 'error') Alert.alert('오류', '장소 저장에 실패했어요.');
    },
    [editingPlace, placeCoord]
  );

  // 위치 이동 확정 — 좌표 갱신 + 주소 재조회 후 상세 카드 복귀
  const confirmMove = useCallback(async () => {
    if (!movingPlace || !moveCoord) return;
    const next = await movePlace(movingPlace, moveCoord[1], moveCoord[0]);
    setMovingPlace(null);
    setMoveCoord(null);
    setSelectedPlace(next);
  }, [movingPlace, moveCoord]);

  const cameraRef = useRef<ComponentRef<typeof Camera>>(null);
  const pencilRef = useRef<ComponentRef<typeof PointAnnotation>>(null);
  const didAutoCenter = useRef(false);
  const isFocusingRef = useRef(false); // 프로그램적 카메라 이동 중 — 지도이동 닫힘 무시

  // 마커를 화면 상단 2/3 지점에 놓아 카드가 화면 중앙에 오게 한다(paddingTop=H/3 → center 아래로).
  const focusPlace = useCallback(
    (lng: number, lat: number) => {
      isFocusingRef.current = true;
      cameraRef.current?.setCamera({
        centerCoordinate: [lng, lat],
        padding: { paddingTop: screenH / 3, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 },
        animationDuration: 350,
      });
      setTimeout(() => {
        isFocusingRef.current = false;
      }, 450);
    },
    [screenH]
  );

  // 스토어에서 최신 위치를 읽어 카메라 이동(스테일 클로저 방지).
  const recenter = useCallback((animated: boolean) => {
    const loc = useMapStore.getState().currentLocation;
    if (loc && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [loc.lng, loc.lat],
        zoomLevel: 15,
        padding: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 }, // 장소 focus의 padding 잔류 리셋
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
        onPress={() => {
          // 지도 빈 곳 탭 → 열린 장소 카드 닫기 (팬/줌엔 onPress 안 옴 → 맵 흐름 유지)
          if (selectedPlace) setSelectedPlace(null);
        }}
        onLongPress={(e) => {
          const g = e.geometry;
          if (g.type !== 'Point') return;
          const [lng, lat] = g.coordinates;
          showPencil(lng, lat); // 연필 핀 표시 + 분류 팝업
        }}
        onCameraChanged={(e) => {
          const next = visForZoom(e.properties?.zoom ?? 15);
          setVis((prev) => (sameVis(prev, next) ? prev : next));
          // 사용자가 지도를 움직이면 장소 카드 닫기 (focus 애니 중은 isFocusingRef로 무시)
          if (!isFocusingRef.current && selectedPlace) setSelectedPlace(null);
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
            ref={pencilRef}
            id="pencil-pin"
            coordinate={pinCoord}
            anchor={{ x: 0.16, y: 0.9 }}
            draggable
            onDragEnd={(payload) => {
              const c = payload.geometry.coordinates;
              showPencil(c[0], c[1]); // 드래그해 놓으면 타일 중심으로 스냅 + 분류 팝업
            }}
          >
            <Image
              source={require('../../assets/pencil.png')}
              style={styles.pencil}
              resizeMode="contain"
              fadeDuration={0}
              // iOS PointAnnotation은 자식 스냅샷을 마운트 시점에 찍어서 첫 롱프레스에
              // 이미지가 안 보이는 이슈가 있음 → 로드 완료 후 강제 갱신
              onLoad={() => pencilRef.current?.refresh()}
            />
          </PointAnnotation>
        )}
        <LandmarkMarkers
          full={vis.thumbs}
          mid={vis.photos} // 별 단계: photos줌(≥11)=glow, 미만=dot
          showSubway={vis.subway}
          showCommon={vis.common}
          showRare={vis.rare}
          showEpic={vis.epic}
        />
        <PhotoMarkers thumbnails={vis.thumbs} visible={vis.photos} onSelect={setViewerPhotos} />
        {/* 나만의 장소 (이동 중인 건 드래그 핀으로 대체) */}
        <PlaceMarkers
          visible={vis.photos}
          full={vis.thumbs}
          hideId={movingPlace?.id}
          selectedId={selectedPlace?.id}
          onSelect={(p) => {
            removePencil();
            setMenuOpen(false); // 마커 선택 시 메뉴 닫기
            setSelectedPlace(p);
            focusPlace(p.lng, p.lat); // 마커를 화면 중앙으로 → 카드가 그 위에 뜸
          }}
          onLongPress={(p) => {
            // 길게 누르면 위치 이동 모드
            removePencil();
            setMenuOpen(false);
            setSelectedPlace(null);
            setMovingPlace(p);
            setMoveCoord([p.lng, p.lat]);
            focusPlace(p.lng, p.lat);
          }}
        />
        {/* 위치 이동 모드 — 드래그 가능한 핀으로 정밀 배치 */}
        {movingPlace && moveCoord && (
          <PointAnnotation
            id="place-move"
            coordinate={moveCoord}
            anchor={{ x: 0.5, y: 1 }}
            draggable
            onDragEnd={(payload) => {
              const c = payload.geometry.coordinates;
              setMoveCoord([c[0], c[1]]);
            }}
          >
            <View style={styles.movePin}>
              <PlaceIcon value={movingPlace.emoji} size={26} />
            </View>
          </PointAnnotation>
        )}
        <LocationMarker />
      </MapView>

      {/* 상단 탐험 통계 오버레이 — 탭바와 같은 글래스모피즘 (테잎 + 살짝 기울임 유지) */}
      <View style={[styles.statCard, { top: insets.top + 20 }]} pointerEvents="none">
        <View style={styles.statGlass}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.statTint} />
          <Text style={styles.statLabel}>내가 밝힌 땅</Text>
          <Text style={styles.statValue}>{abbrev(tiles)} 칸</Text>
          <Text style={styles.statSub}>
            Lv {level} · 오늘 {abbrev(todayNewTiles)}칸 · 🔥 {streak}일
          </Text>
        </View>
        {/* 테잎은 글래스 클립(overflow) 밖 — 카드 위에 걸치도록 나중에 그림 */}
        <Tape width={58} height={18} color="rgba(200,245,96,0.5)" style={styles.statTapePos} />
      </View>

      {/* 우상단 햄버거 메뉴 — 잉크·편지함 수납 (탭바·카드와 같은 글래스 레시피) */}
      <View style={[styles.menuWrap, { top: insets.top + 20 }]}>
        <TouchableOpacity
          style={styles.menuButton}
          activeOpacity={0.85}
          onPress={() => setMenuOpen((o) => !o)}
          accessibilityLabel={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
        >
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.menuTint} />
          {menuOpen ? (
            <Text style={styles.menuCloseGlyph}>✕</Text>
          ) : (
            <View style={styles.menuBars}>
              <View style={styles.menuBar} />
              <View style={styles.menuBar} />
              <View style={styles.menuBar} />
            </View>
          )}
          {recapReady && !menuOpen && <View style={styles.mailDot} />}
        </TouchableOpacity>

        {menuOpen && (
          <View style={styles.menuPanel}>
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.menuTint} />
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.85}
              onPress={() => {
                setMenuOpen(false);
                Alert.alert(
                  '잉크',
                  `보유 잉크 ${ink}\n\n걸을수록 잉크가 모여요. 지도를 길게 눌러 회색 안개를 잉크로 밝혀보세요 ✏️`
                );
              }}
              accessibilityLabel={`잉크 ${ink}`}
            >
              <Image
                source={require('../../assets/ink.png')}
                style={styles.menuIcon}
                resizeMode="contain"
              />
              <View style={styles.inkBadge}>
                <Text style={styles.inkBadgeText}>{abbrev(ink)}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.85}
              onPress={() => {
                setMenuOpen(false);
                if (recapReady) {
                  playRecap(); // 탐험 일지(별자리 리캡) 재생
                } else {
                  Alert.alert('편지함', '아직 새 소식이 없어요 💌\n더 걸으면 탐험 일지가 도착해요!');
                }
              }}
              accessibilityLabel={recapReady ? '탐험 일지 도착' : '편지함'}
            >
              <Image
                source={require('../../assets/mail.png')}
                style={styles.menuIcon}
                resizeMode="contain"
              />
              {recapReady && <View style={styles.mailDot} />}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 연필 핀 팝업: 판별 + 잉크로 밝히기(회색만: 1칸 / 연결 일괄). 드래그로 이동 시 갱신, X로 연필 제거 */}
      {pinTarget &&
        (() => {
          const oneCost = CONFIG.INK_COST_GRAY;
          // 일괄 = 연결 영역 중 잉크로 살 수 있는 만큼(가까운 순). 2칸 이상일 때만 버튼 노출.
          const region = pinTarget.kind === 'gray' ? pinTarget.tiles : [];
          const bulkN = Math.min(region.length, Math.floor(ink / oneCost));
          const bulkWhole =
            pinTarget.kind === 'gray' && !pinTarget.truncated && bulkN === region.length;
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
                    검은 안개는 잉크로 밝힐 수 없어요. 가까운 회색 안개를 밝히면 그 주변이
                    회색으로 걷혀요 ✏️
                  </Text>
                )}

                {pinTarget.kind === 'land' && (
                  <TouchableOpacity
                    onPress={() => {
                      if (!pinCoord) return;
                      setPlaceCoord(pinCoord);
                      removePencil();
                    }}
                    activeOpacity={0.85}
                    style={styles.pinAction}
                    accessibilityLabel="나만의 장소 만들기"
                  >
                    <Text style={styles.pinActionText}>
                      🚩 나만의 장소 만들기 (잉크 {CONFIG.INK_COST_PLACE})
                    </Text>
                  </TouchableOpacity>
                )}

                {pinTarget.kind === 'gray' && (
                  <>
                    <TouchableOpacity
                      onPress={() => clearWithInk([region[0]])}
                      disabled={ink < oneCost}
                      activeOpacity={0.85}
                      style={[styles.pinAction, ink < oneCost && styles.pinActionDisabled]}
                      accessibilityLabel={`잉크 ${oneCost}로 이 칸 밝히기`}
                    >
                      <Text
                        style={[styles.pinActionText, ink < oneCost && styles.pinActionTextDisabled]}
                      >
                        {ink >= oneCost
                          ? `🖌️ 이 칸 밝히기 (잉크 ${oneCost})`
                          : `잉크 부족 · ${oneCost} 필요 (보유 ${ink})`}
                      </Text>
                    </TouchableOpacity>

                    {bulkN >= 2 && (
                      <TouchableOpacity
                        onPress={() => clearWithInk(region.slice(0, bulkN))}
                        activeOpacity={0.85}
                        style={styles.pinAction}
                        accessibilityLabel={`잉크 ${bulkN * oneCost}로 ${bulkN}칸 밝히기`}
                      >
                        <Text style={styles.pinActionText}>
                          {bulkWhole
                            ? `🖌️ 연결된 ${bulkN}칸 모두 밝히기 (잉크 ${bulkN * oneCost})`
                            : `🖌️ 가까운 ${bulkN}칸 밝히기 (잉크 ${bulkN * oneCost})`}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            </View>
          );
        })()}

      {/* 나만의 장소 플로팅 카드 — 화면 중앙의 마커 위에 뜨고 꼬리가 마커를 가리킴
          (마커는 onSelect에서 카메라로 화면 중앙에 정렬됨) */}
      {selectedPlace && !movingPlace && !editingPlace && (
        <View
          style={[styles.placeCardWrap, { bottom: screenH / 3 + 26 }]}
          pointerEvents="box-none"
        >
          <PlaceFloatingCard
            place={selectedPlace}
            onEdit={() => setEditingPlace(selectedPlace)}
            onClose={() => setSelectedPlace(null)}
          />
        </View>
      )}

      {/* 대형 해외 지역팩 보류 칩 (이동 중이 아닐 때만 — 위치 겹침 방지) */}
      {!movingPlace && <RegionPackChip />}

      {/* 위치 이동 확인 바 */}
      {movingPlace && (
        <View style={[styles.moveBar, { bottom: insets.bottom + 96 }]} pointerEvents="box-none">
          <View style={styles.moveBarCard}>
            <Text style={styles.moveBarText}>핀을 끌어서 위치를 조정하세요</Text>
            <View style={styles.moveBarBtns}>
              <TouchableOpacity
                style={[styles.moveBtn, styles.moveBtnPrimary]}
                onPress={() => void confirmMove()}
                activeOpacity={0.85}
              >
                <Text style={styles.moveBtnPrimaryText}>여기로 저장</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.moveBtn}
                onPress={() => {
                  setSelectedPlace(movingPlace);
                  setMovingPlace(null);
                  setMoveCoord(null);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.moveBtnText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 나만의 장소 생성/수정 시트 */}
      <PlaceEditorSheet
        visible={placeCoord != null || editingPlace != null}
        editing={editingPlace}
        ink={ink}
        onSave={(draft) => void savePlace(draft)}
        onClose={() => {
          setPlaceCoord(null);
          setEditingPlace(null);
        }}
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
  pencil: { width: 44, height: 44 },
  // 우상단 햄버거 메뉴 — 버튼·패널 모두 글래스 레시피(블러+틴트+네온퍼플 보더)
  menuWrap: { position: 'absolute', right: 16, alignItems: 'flex-end' },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.violet,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  menuTint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15,17,32,0.45)',
  },
  menuBars: { gap: 4 },
  menuBar: { width: 18, height: 2, borderRadius: 1, backgroundColor: COLORS.violet },
  menuCloseGlyph: { color: COLORS.violet, fontSize: 16, fontWeight: '700' },
  menuPanel: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.violet,
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 10,
    alignItems: 'center',
  },
  menuItem: { width: 48, height: 48 },
  menuIcon: { width: 48, height: 48 },
  // 탐험 일지 도착 표시 (핫핑크 점 + 흰 테두리)
  mailDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: COLORS.hotpink,
    borderWidth: 1.5,
    borderColor: '#F4EFE6',
  },
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

  // 나만의 장소 — 플로팅 카드(중앙 마커 위)/이동 모드
  placeCardWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  movePin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.land, // 밝은 배경 — 잉크색 글리프 가독성
    borderWidth: 2.5,
    borderColor: COLORS.lime, // 이동 중 = 라임 (확정 전 강조)
    alignItems: 'center',
    justifyContent: 'center',
  },
  moveBar: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  moveBarCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  moveBarText: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  moveBarBtns: { flexDirection: 'row', gap: 8, marginTop: 10 },
  moveBtn: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 11,
    backgroundColor: COLORS.fogLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  moveBtnPrimary: { backgroundColor: COLORS.lime, borderColor: COLORS.lime },
  moveBtnPrimaryText: { color: COLORS.ink, fontSize: 13, fontWeight: '800' },
  moveBtnText: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  // 바깥: 위치/기울임/그림자만 (overflow:hidden 이 그림자·테잎을 자르지 않도록 분리)
  statCard: {
    position: 'absolute',
    left: 16,
    borderRadius: 16,
    transform: [{ rotate: '-2.5deg' }],
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  // 안쪽: 탭바와 동일한 글래스 레시피 (블러 + 틴트 + 네온퍼플 보더)
  statGlass: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.violet,
  },
  statTint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15,17,32,0.45)',
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
