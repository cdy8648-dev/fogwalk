import { useMemo } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { CircleLayer, MarkerView, ShapeSource } from '@rnmapbox/maps';

import { CATEGORY_ICON } from '../../constants/categoryIcons';
import { landmarkDisplayName, rarityColor, rarityLabel } from '../../constants/landmarks';
import { MARKER_DOT } from '../../constants/markerStyle';
import { MapMarkerGlyph } from '../CategoryIcon';
import { useLandmarkStore } from '../../store/landmarkStore';
import type { Landmark } from '../../types';
import { dedupLandmarks } from '../../utils/landmarkDedup';

interface Props {
  full: boolean; // true=글리프(줌인), false=점(줌아웃)
  showSubway: boolean; // false면 지하철 마커 숨김 (줌아웃 시 가장 먼저)
  showCommon: boolean; // false면 일반(common) 랜드마크 숨김
  showRare: boolean; // false면 희귀(rare) 숨김
  showEpic: boolean; // false면 영웅(epic)도 숨김 → 전설만 남음
}

// 전설만 마커를 조금 키워 위계 강조(등급색은 SVG 글로우에 내장).
function glyphSize(lm: Landmark): number {
  return lm.rarity === 'legendary' ? 50 : 44;
}

/**
 * 발견한 랜드마크 마커.
 * 줌인=배경 없는 카테고리 글리프(등급 글로우 내장), 줌아웃=등급색 점(장소·사진과 동일 규격).
 * 줌아웃 단계별로 지하철→일반→희귀→영웅 순으로 사라지고 결국 전설만 남는다.
 */
export default function LandmarkMarkers({
  full,
  showSubway,
  showCommon,
  showRare,
  showEpic,
}: Props) {
  const discovered = useLandmarkStore((s) => s.discovered);
  const landmarks = useMemo(
    () =>
      dedupLandmarks(discovered).filter((l) => {
        if (l.category === 'subway') return showSubway;
        const r = l.rarity ?? 'common';
        if (r === 'legendary') return true;
        if (r === 'epic') return showEpic;
        if (r === 'rare') return showRare;
        return showCommon; // common
      }),
    [discovered, showSubway, showCommon, showRare, showEpic]
  );

  // 줌아웃: 등급색 점 (GPU CircleLayer — 마커 수 무관 저비용, 장소·사진과 동일 규격)
  const dotShape = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: landmarks.map((lm) => ({
        type: 'Feature' as const,
        properties: { color: rarityColor(lm.rarity) },
        geometry: { type: 'Point' as const, coordinates: [lm.lng, lm.lat] },
      })),
    }),
    [landmarks]
  );

  if (!full) {
    if (landmarks.length === 0) return null;
    return (
      <ShapeSource id="lm-dots" shape={dotShape}>
        <CircleLayer
          id="lm-dots-layer"
          style={{
            circleRadius: MARKER_DOT.radius,
            circleColor: ['get', 'color'],
            circleStrokeColor: MARKER_DOT.strokeColor,
            circleStrokeWidth: MARKER_DOT.strokeWidth,
          }}
        />
      </ShapeSource>
    );
  }

  // 줌인: 배경 없는 카테고리 글리프 (등급 글로우 내장)
  return (
    <>
      {landmarks.map((lm) => (
        <MarkerView
          key={lm.osmId}
          id={`lm-${lm.osmId}`}
          coordinate={[lm.lng, lm.lat]}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => Alert.alert(landmarkDisplayName(lm), rarityLabel(lm.rarity))}
            hitSlop={10}
          >
            <MapMarkerGlyph
              icon={CATEGORY_ICON[lm.category] ?? 'detail-pin'}
              rarity={lm.rarity}
              size={glyphSize(lm)}
            />
          </TouchableOpacity>
        </MarkerView>
      ))}
    </>
  );
}
