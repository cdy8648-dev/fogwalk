import { useMemo } from 'react';
import { FillLayer, ShapeSource } from '@rnmapbox/maps';

import { COLORS } from '../../constants/colors';
import { CONFIG } from '../../constants/config';
import { useMapStore } from '../../store/mapStore';
import { dilateTiles, tilesToRevealedPolygons } from '../../utils/h3';

// 세계 전체를 덮는 바깥 링.
const WORLD_RING: number[][] = [
  [-180, -85],
  [180, -85],
  [180, 85],
  [-180, 85],
  [-180, -85],
];

/**
 * 밝힌 영역(MultiPolygon)을 세계에서 빼낸 안개 Feature 생성.
 *  - 메인 폴리곤: WORLD_RING(바깥) + 각 밝힌영역의 외곽링(구멍) → 밝힌 곳 뚫림
 *  - 각 밝힌영역의 내부 홀(도넛 구멍 = 둘러쌌지만 안 간 곳)은 별도 폴리곤(섬)으로 다시 안개 처리
 */
function fogFeature(revealedPolygons: number[][][][]) {
  const outerRings = revealedPolygons.map((polygon) => polygon[0]);
  const innerIslands: number[][][][] = [];
  for (const polygon of revealedPolygons) {
    for (let i = 1; i < polygon.length; i++) {
      innerIslands.push([polygon[i]]); // 도넛 구멍을 다시 안개 섬으로
    }
  }
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'MultiPolygon' as const,
      coordinates: [[WORLD_RING, ...outerRings], ...innerIslands],
    },
  };
}

/**
 * 2단계 안개 마스크 (Fill 2장 겹침):
 *  - 어두운 층: 밝힌영역+버퍼 밖을 진하게 (미지)
 *  - 옅은 층(위): 밝힌영역 밖을 옅게 (버퍼=프론티어)
 *  → 밝힌곳=선명 / 버퍼=옅음 / 그 외=거의 안 보임.
 */
export default function FogLayer() {
  const visitedTileIds = useMapStore((s) => s.visitedTileIds);
  const fogVersion = useMapStore((s) => s.fogVersion);

  const { nearShape, farShape } = useMemo(() => {
    const visited = [...visitedTileIds];
    const near = fogFeature(tilesToRevealedPolygons(visited));
    const far = fogFeature(
      tilesToRevealedPolygons(dilateTiles(visited, CONFIG.FOG_NEAR_RADIUS_K))
    );
    return { nearShape: near, farShape: far };
    // fogVersion이 방문 타일 변경 시 함께 증가하므로 무효화 키로 사용
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fogVersion]);

  return (
    <>
      {/* 어두운 층 (아래) */}
      <ShapeSource id="fog-far-source" shape={farShape}>
        <FillLayer
          id="fog-far-fill"
          style={{ fillColor: COLORS.fog, fillOpacity: CONFIG.FOG_FAR_OPACITY }}
        />
      </ShapeSource>
      {/* 옅은 층 (위) */}
      <ShapeSource id="fog-near-source" shape={nearShape}>
        <FillLayer
          id="fog-near-fill"
          style={{ fillColor: COLORS.fog, fillOpacity: CONFIG.FOG_NEAR_OPACITY }}
        />
      </ShapeSource>
    </>
  );
}
