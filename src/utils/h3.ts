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

/**
 * 좌표의 안개가 밝힌 땅으로 완전히 둘러싸인 '구멍'인지 판별(땅따먹기).
 * 미방문 타일을 BFS로 확장 — 방문 타일이 벽 역할. 벽에 막혀 maxTiles 안에서
 * 확장이 끝나면 구멍 타일 전체를 반환, 넘게 퍼지면(열린 안개/너무 큼) null.
 */
export function enclosedFogAt(
  lat: number,
  lng: number,
  visited: Set<string>,
  maxTiles: number
): string[] | null {
  const start = coordToTile(lat, lng);
  if (visited.has(start)) return null;
  const seen = new Set<string>([start]);
  const queue = [start];
  while (queue.length > 0) {
    const cur = queue.pop()!;
    for (const n of gridDisk(cur, 1)) {
      if (seen.has(n) || visited.has(n)) continue;
      seen.add(n);
      if (seen.size > maxTiles) return null;
      queue.push(n);
    }
  }
  return [...seen];
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
