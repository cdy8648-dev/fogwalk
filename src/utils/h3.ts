import {
  cellArea,
  cellToBoundary,
  cellsToMultiPolygon,
  gridDisk,
  latLngToCell,
} from 'h3-js';

import { CONFIG } from '../constants/config';

/** 좌표 → H3 타일 ID (기본 해상도). */
export function coordToTile(lat: number, lng: number): string {
  return latLngToCell(lat, lng, CONFIG.H3_RESOLUTION);
}

/** 타일 경계 폴리곤. [lng, lat] 순서 (GeoJSON용). */
export function tileToPolygon(tileId: string): number[][] {
  return cellToBoundary(tileId, true);
}

/** 현재 위치에서 밝힐 타일들 (현재 타일 + gridDisk(k)). */
export function revealTilesFor(lat: number, lng: number): string[] {
  const tile = coordToTile(lat, lng);
  return gridDisk(tile, CONFIG.REVEAL_RADIUS_K);
}

/**
 * 안개 구멍용 링 배열.
 * cellsToMultiPolygon으로 인접 타일을 매끈한 영역으로 병합한 뒤,
 * 각 폴리곤의 바깥 링만 추출 (내부 도넛 홀은 MVP에서 무시).
 * 반환: [lng, lat] 순서의 링 배열.
 */
export function tilesToFogHoles(tileIds: string[]): number[][][] {
  if (tileIds.length === 0) return [];
  const multiPolygon = cellsToMultiPolygon(tileIds, true);
  return multiPolygon.map((polygon) => polygon[0]); // 각 폴리곤의 외곽 링
}

/** 타일 면적 (km²). */
export function tileAreaKm2(tileId: string): number {
  return cellArea(tileId, 'km2');
}
