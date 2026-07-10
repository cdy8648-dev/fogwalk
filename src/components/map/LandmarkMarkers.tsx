import { useMemo } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { CircleLayer, MarkerView, ShapeSource } from '@rnmapbox/maps';

import { COLORS } from '../../constants/colors';
import { CATEGORY_ICON } from '../../constants/categoryIcons';
import { landmarkDisplayName, rarityColor, rarityLabel } from '../../constants/landmarks';
import { CategoryGlyph } from '../CategoryIcon';
import { useLandmarkStore } from '../../store/landmarkStore';

interface Props {
  full: boolean; // true=이모지 핀, false=점 (줌아웃)
  showSubway: boolean; // false면 지하철 마커 숨김 (줌아웃 시 가장 먼저)
  showCommon: boolean; // false면 일반(common) 랜드마크 숨김
  showRare: boolean; // false면 희귀(rare) 숨김
  showEpic: boolean; // false면 영웅(epic)도 숨김 → 전설만 남음
}

/** 발견한 랜드마크. 줌인=카테고리 이모지 핀, 줌아웃=점(가벼움). 색은 희귀도별.
 *  줌아웃 단계별로 지하철→일반→희귀→영웅 순으로 사라지고 결국 전설만 남는다. */
export default function LandmarkMarkers({ full, showSubway, showCommon, showRare, showEpic }: Props) {
  const discovered = useLandmarkStore((s) => s.discovered);
  const landmarks = useMemo(
    () =>
      discovered.filter((l) => {
        if (l.category === 'subway') return showSubway;
        const r = l.rarity ?? 'common';
        if (r === 'legendary') return true;
        if (r === 'epic') return showEpic;
        if (r === 'rare') return showRare;
        return showCommon; // common
      }),
    [discovered, showSubway, showCommon, showRare, showEpic]
  );

  const dotShape = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: landmarks.map((lm) => ({
        type: 'Feature' as const,
        properties: { rarity: lm.rarity ?? 'common' },
        geometry: { type: 'Point' as const, coordinates: [lm.lng, lm.lat] },
      })),
    }),
    [landmarks]
  );

  if (!full) {
    return (
      <ShapeSource id="lm-dots" shape={dotShape}>
        <CircleLayer
          id="lm-dots-layer"
          style={{
            circleRadius: 4,
            circleColor: [
              'match',
              ['get', 'rarity'],
              'legendary',
              COLORS.gold,
              'epic',
              COLORS.violet,
              'rare',
              COLORS.teal,
              'rgba(255,255,255,0.75)', // 일반 = 희미한 흰 점 (별빛 규칙)
            ],
            circleStrokeColor: COLORS.ink,
            circleStrokeWidth: 1,
          }}
        />
      </ShapeSource>
    );
  }

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
          >
            {/* 글리프 마커 (에셋 규칙: 네이비 배경원 + 등급색 링) — 전설은 링 더 두껍게 */}
            <CategoryGlyph
              icon={CATEGORY_ICON[lm.category] ?? 'detail-pin'}
              size={30}
              ringColor={rarityColor(lm.rarity)}
              style={lm.rarity === 'legendary' ? styles.legendary : undefined}
            />
          </TouchableOpacity>
        </MarkerView>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  legendary: { borderWidth: 3 }, // 전설은 링 더 두껍게(색은 rarityColor=골드)
});
