import { useMemo } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { MarkerView } from '@rnmapbox/maps';

import { CATEGORY_ICON } from '../../constants/categoryIcons';
import { landmarkDisplayName, rarityLabel } from '../../constants/landmarks';
import { MapMarkerGlyph, MapStar } from '../CategoryIcon';
import { useLandmarkStore } from '../../store/landmarkStore';
import type { Landmark } from '../../types';

interface Props {
  full: boolean; // true=글리프(줌인), false=별(줌아웃)
  mid: boolean; // 별 단계: true=star-glow(가까운 줌), false=star-dot(먼 줌)
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
 * 줌인=배경 없는 카테고리 글리프(등급 글로우 내장), 줌아웃=별자리 별(등급색).
 * 줌아웃 단계별로 지하철→일반→희귀→영웅 순으로 사라지고 결국 전설만 남는다.
 */
export default function LandmarkMarkers({
  full,
  mid,
  showSubway,
  showCommon,
  showRare,
  showEpic,
}: Props) {
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

  const starSize = mid ? 14 : 8;

  return (
    <>
      {landmarks.map((lm) => (
        <MarkerView
          key={lm.osmId}
          id={`lm-${lm.osmId}`}
          coordinate={[lm.lng, lm.lat]}
          anchor={{ x: 0.5, y: 0.5 }}
          allowOverlap={!full} // 줌아웃 별은 겹쳐도 표시(밀도), 줌인 글리프는 declutter
        >
          {full ? (
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
          ) : (
            <MapStar rarity={lm.rarity} variant={mid ? 'glow' : 'dot'} size={starSize} />
          )}
        </MarkerView>
      ))}
    </>
  );
}
