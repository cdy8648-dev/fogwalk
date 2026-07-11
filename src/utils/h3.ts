import {
  cellsToMultiPolygon,
  cellToLatLng,
  getHexagonAreaAvg,
  gridDisk,
  gridPathCells,
  latLngToCell,
} from 'h3-js';

import { CONFIG } from '../constants/config';

/** 타일 1칸의 평균 면적(km²). 달성률(밝힌칸→면적) 계산에 사용. */
export const TILE_AREA_KM2 = getHexagonAreaAvg(CONFIG.H3_RESOLUTION, 'km2');

/** 좌표 → H3 타일 ID (기본 해상도). */
export function coordToTile(lat: number, lng: number): string {
  return latLngToCell(lat, lng, CONFIG.H3_RESOLUTION);
}

/** 좌표가 속한 육각타일의 중심 [lng, lat]. 연필 핀을 타일 가운데로 스냅할 때 사용. */
export function tileCenterCoord(lat: number, lng: number): [number, number] {
  const [cLat, cLng] = cellToLatLng(coordToTile(lat, lng));
  return [cLng, cLat];
}

/** 타일 ID → 중심 좌표. 탐험 일지(별자리)에서 타일 시퀀스를 점으로 투영할 때 사용. */
export function cellCenter(tileId: string): { lat: number; lng: number } {
  const [lat, lng] = cellToLatLng(tileId);
  return { lat, lng };
}

/** 현재 위치에서 밝힐 타일들 (현재 타일 + gridDisk(k)). */
export function revealTilesFor(lat: number, lng: number): string[] {
  const tile = coordToTile(lat, lng);
  return gridDisk(tile, CONFIG.REVEAL_RADIUS_K);
}

/**
 * 두 좌표 사이 H3 직선 경로 타일(+걷기와 같은 reveal 폭 k).
 * 백그라운드처럼 픽스가 드문드문 올 때 사이 구멍을 메운다(경로 보간).
 * 같은 타일이면 [] (보간 불필요), gridPathCells 실패(펜타곤 경유 등) 시에도 [].
 */
export function pathRevealTiles(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): string[] {
  const a = coordToTile(aLat, aLng);
  const b = coordToTile(bLat, bLng);
  if (a === b) return [];
  try {
    return dilateTiles(gridPathCells(a, b), CONFIG.REVEAL_RADIUS_K);
  } catch {
    return [];
  }
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

/**
 * 좌표가 속한 '연결된 회색 안개' 영역을 가까운 순(BFS)으로 최대 limit칸 수집.
 * 회색 = 미방문이면서 FOG_NEAR_RADIUS_K 안에 밝힌 타일이 있음(fogClassAt 'near'와 동일 기준).
 * 회색 프론티어는 영토 전체를 감싸는 띠라 매우 클 수 있음 → limit으로 탐색을 끊는다.
 * 반환 [0] = 시작 타일. 시작이 회색이 아니면 [].
 */
export function grayRegionAt(
  lat: number,
  lng: number,
  visited: Set<string>,
  limit: number
): string[] {
  const isGray = (tile: string): boolean => {
    if (visited.has(tile)) return false;
    for (const t of gridDisk(tile, CONFIG.FOG_NEAR_RADIUS_K)) {
      if (visited.has(t)) return true;
    }
    return false;
  };
  const start = coordToTile(lat, lng);
  if (limit < 1 || !isGray(start)) return [];
  const region = [start]; // FIFO 순회 → 가까운 칸부터 담김
  const seen = new Set<string>([start]);
  for (let i = 0; i < region.length && region.length < limit; i++) {
    for (const n of gridDisk(region[i], 1)) {
      if (seen.has(n) || !isGray(n)) continue;
      seen.add(n);
      region.push(n);
      if (region.length >= limit) break;
    }
  }
  return region;
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
