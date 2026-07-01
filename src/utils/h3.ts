import { cellsToMultiPolygon, getHexagonAreaAvg, gridDisk, latLngToCell } from 'h3-js';

import { CONFIG } from '../constants/config';

/** 타일 1칸의 평균 면적(km²). 달성률(밝힌칸→면적) 계산에 사용. */
export const TILE_AREA_KM2 = getHexagonAreaAvg(CONFIG.H3_RESOLUTION, 'km2');

/** 좌표 → H3 타일 ID (기본 해상도). */
export function coordToTile(lat: number, lng: number): string {
  return latLngToCell(lat, lng, CONFIG.H3_RESOLUTION);
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

export type FogClass = 'land' | 'near' | 'far';

/**
 * 좌표가 밝힌 땅 / 회색(근접) 안개 / 검은 안개 중 무엇인지 분류.
 * - land: 타일이 밝힌 집합에 있음
 * - near: 밝힌 곳에서 FOG_NEAR_RADIUS_K 안(버퍼) — FogLayer 옅은 안개와 동일 기준
 * - far: 그 외
 */
export function fogClassAt(lat: number, lng: number, visited: Set<string>): FogClass {
  const tile = coordToTile(lat, lng);
  if (visited.has(tile)) return 'land';
  for (const t of gridDisk(tile, CONFIG.FOG_NEAR_RADIUS_K)) {
    if (visited.has(t)) return 'near';
  }
  return 'far';
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
