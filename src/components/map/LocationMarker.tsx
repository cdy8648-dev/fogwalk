import { CircleLayer, ShapeSource } from '@rnmapbox/maps';

import { COLORS } from '../../constants/colors';
import { useMapStore } from '../../store/mapStore';

/** 현재 위치에 라임색 점 + 외곽 헤일로. currentLocation이 없으면 렌더 안 함. */
export default function LocationMarker() {
  const currentLocation = useMapStore((s) => s.currentLocation);
  if (!currentLocation) return null;

  const point = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'Point' as const,
      coordinates: [currentLocation.lng, currentLocation.lat],
    },
  };

  return (
    <ShapeSource id="me-source" shape={point}>
      <CircleLayer
        id="me-halo"
        style={{ circleRadius: 18, circleColor: COLORS.lime, circleOpacity: 0.25 }}
      />
      <CircleLayer
        id="me-dot"
        aboveLayerID="me-halo"
        style={{
          circleRadius: 6,
          circleColor: COLORS.lime,
          circleStrokeColor: '#FFFFFF',
          circleStrokeWidth: 2,
        }}
      />
    </ShapeSource>
  );
}
