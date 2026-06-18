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
 * 밝힌 타일들을 병합한 GeoJSON MultiPolygon. 각 폴리곤 = [외곽링, ...내부홀].
 * 내부 홀(도넛 구멍 = 둘러싸였지만 안 간 곳)을 보존한다 — FogLayer에서 다시 안개로 처리.
 * 좌표는 [lng, lat] 순서.
 */
export function tilesToRevealedPolygons(tileIds: string[]): number[][][][] {
  if (tileIds.length === 0) return [];
  return cellsToMultiPolygon(tileIds, true);
}

/** 타일 면적 (km²). */
export function tileAreaKm2(tileId: string): number {
  return cellArea(tileId, 'km2');
}

/** 타일 집합을 gridDisk(k)로 팽창(dilate)시킨 합집합. 안개 버퍼 영역 계산용. */
export function dilateTiles(tileIds: string[], k: number): string[] {
  if (tileIds.length === 0) return [];
  const out = new Set<string>();
  for (const id of tileIds) {
    for (const neighbor of gridDisk(id, k)) out.add(neighbor);
  }
  return [...out];
}
