import { useMemo } from 'react';
import { FillLayer, ShapeSource } from '@rnmapbox/maps';

import { COLORS } from '../../constants/colors';
import { useMapStore } from '../../store/mapStore';
import { tilesToFogHoles } from '../../utils/h3';

// 세계 전체를 덮는 바깥 링. 밝혀진 영역은 안쪽 구멍(hole)으로 뚫린다.
const WORLD_RING: number[][] = [
  [-180, -85],
  [180, -85],
  [180, 85],
  [-180, 85],
  [-180, -85],
];

/**
 * 미탐험 영역을 어둡게 덮는 안개 마스크.
 * 세계 사각형(바깥 링) + 방문 영역(안쪽 구멍)으로 이루어진 '구멍 뚫린 폴리곤'.
 */
export default function FogLayer() {
  const visitedTileIds = useMapStore((s) => s.visitedTileIds);
  const fogVersion = useMapStore((s) => s.fogVersion);

  const shape = useMemo(() => {
    const holes = tilesToFogHoles([...visitedTileIds]);
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'Polygon' as const,
        coordinates: [WORLD_RING, ...holes], // 바깥 링 + 구멍들
      },
    };
    // fogVersion이 방문 타일 변경 시 함께 증가하므로 이를 무효화 키로 사용
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fogVersion]);

  return (
    <ShapeSource id="fog-source" shape={shape}>
      <FillLayer
        id="fog-fill"
        style={{ fillColor: COLORS.fog, fillOpacity: 0.92 }}
      />
    </ShapeSource>
  );
}
