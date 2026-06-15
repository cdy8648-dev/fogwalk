import {
  cellToBoundary,
  cellToLatLng,
  gridDisk,
  latLngToCell,
} from 'h3-js';

import { CONFIG } from '../constants/config';
import type { Coordinate } from '../types';

/** 좌표를 기본 해상도(CONFIG.H3_RESOLUTION)의 H3 셀 ID로 변환. */
export function coordToTileId(coord: Coordinate): string {
  return latLngToCell(coord.lat, coord.lng, CONFIG.H3_RESOLUTION);
}

/** H3 셀의 중심 좌표. */
export function tileCenter(tileId: string): Coordinate {
  const [lat, lng] = cellToLatLng(tileId);
  return { lat, lng };
}

/**
 * H3 셀의 경계 폴리곤을 GeoJSON 순서([lng, lat]) 좌표 배열로 반환.
 * Mapbox ShapeSource 에 바로 넣을 수 있는 형태.
 */
export function tileBoundary(tileId: string): [number, number][] {
  // formatAsGeoJson=true → [lng, lat] 순서로 반환된다.
  return cellToBoundary(tileId, true) as [number, number][];
}

/** 중심 셀 기준 반경 k 링 안의 모든 셀 ID. */
export function tilesWithin(tileId: string, k: number): string[] {
  return gridDisk(tileId, k);
}
