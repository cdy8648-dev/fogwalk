import { cellToParent } from 'h3-js';

import {
  clearCountryRegionStats,
  getSetting,
  getVisitedTilesSince,
  setCountryTiles,
  setSetting,
  upsertCountryTiles,
  upsertRegionTiles,
  upsertSubregionTiles,
} from './db';
import { attributeTiles } from './country';

/**
 * H3 멤버십 팩 — 행정경계를 compact H3 셀로 구운 오프라인 지역 판정.
 * 타일 → (시/도, 시/군/구) 룩업이 O(1)·네트워크 0·언어 무관이라 배터리 헌장에 부합.
 * 분모(지역 총 타일 수)도 팩에 내장 → 달성률 = 밝힌 타일 / 총 타일 (같은 단위, 오차 상쇄).
 * 현재 KR만 번들(0.9MB). 해외는 기존 역지오코딩-캐시 경로 폴백 → Phase 3에서 국가 팩 확장.
 */

interface Pack {
  v: number;
  country: string;
  resMin: number;
  resMax: number;
  level1: { key: string; en: string }[];
  level2: { name: string; l1: number }[];
  l1Tiles: number[];
  l2Tiles: number[];
  cells: Record<string, number>;
}

let pack: Pack | null = null;

function load(): Pack {
  // 지연 로드 — 0.9MB JSON 파싱을 첫 사용 시점으로 미룸. require 캐시된 object를
  // 그대로 조회(Map 재생성 없음) → 백그라운드 깨움마다 드는 비용 제거.
  if (!pack) pack = require('../constants/regionPacks/kr.json') as Pack;
  return pack;
}

/** 타일 → 지역 인덱스(fine→coarse 부모 순회). 팩 밖이면 -1. */
function tileToL2Idx(p: Pack, tile: string): number {
  for (let res = p.resMax; res >= p.resMin; res--) {
    const idx = p.cells[cellToParent(tile, res)];
    if (idx != null) return idx;
  }
  return -1;
}

/** 타일(res10) → 지역. compact 구조상 모호성 없음. 팩 밖이면 null. */
export function lookupTile(tile: string): { l1: string; l2: string } | null {
  const p = load();
  const idx = tileToL2Idx(p, tile);
  if (idx < 0) return null;
  const l2 = p.level2[idx];
  return { l1: p.level1[l2.l1].key, l2: l2.name };
}

/**
 * 신규 밝힌 타일 적립 — 팩 히트는 정확 판정으로, 미스(해외)는 기존 캐시 경로로.
 * 핫패스에서 호출: 룩업 O(1)/타일 + 그룹 upsert 소수.
 */
export function attributeRevealedTiles(tiles: string[]): void {
  if (tiles.length === 0) return;
  const p = load();
  const byL2 = new Map<number, number>();
  let miss = 0;
  for (const t of tiles) {
    const idx = tileToL2Idx(p, t);
    if (idx < 0) miss++;
    else byL2.set(idx, (byL2.get(idx) ?? 0) + 1);
  }

  let hit = 0;
  for (const [idx, n] of byL2) {
    hit += n;
    const l2 = p.level2[idx];
    const l1 = p.level1[l2.l1].key;
    upsertRegionTiles('KR', l1, n);
    upsertSubregionTiles('KR', l1, l2.name, n);
  }
  if (hit > 0) upsertCountryTiles('KR', '대한민국', hit);
  if (miss > 0) attributeTiles(miss); // 해외/팩 밖 — 역지오코딩 캐시 폴백
}

/**
 * 소급 재계산(1회) — 원시 visited_tiles 전체를 팩으로 재판정해 KR 통계를 재구축.
 * 과거의 이름 흔들림('서울특별시'/'서울'/'Seoul')·경계 오적립(충남→충북)을 청산한다.
 */
export function rebuildKRStatsOnce(): void {
  if (getSetting('region_pack_v1') === '1') return;

  const all = getVisitedTilesSince(0);
  const agg = new Map<number, { n: number; first: number }>();
  let krTotal = 0;
  const p = load();
  for (const { tileId, ts } of all) {
    const idx = tileToL2Idx(p, tileId);
    if (idx < 0) continue;
    krTotal++;
    const cur = agg.get(idx);
    if (!cur) agg.set(idx, { n: 1, first: ts });
    else {
      cur.n++;
      if (ts < cur.first) cur.first = ts;
    }
  }

  clearCountryRegionStats('KR');
  for (const [idx, { n, first }] of agg) {
    const l2 = p.level2[idx];
    const l1 = p.level1[l2.l1].key;
    upsertRegionTiles('KR', l1, n, first);
    upsertSubregionTiles('KR', l1, l2.name, n, first);
  }
  setCountryTiles('KR', '대한민국', krTotal);
  setSetting('region_pack_v1', '1');
  if (__DEV__) console.log(`[regionPack] KR 재집계: ${krTotal} 타일 / ${agg.size} 시군구`);
}

/** 여권 화면용 분모 — 시/도 총 타일 수. 팩에 없으면 null(해외). */
export function l1TotalTiles(l1Key: string): number | null {
  const p = load();
  const i = p.level1.findIndex((x) => x.key === l1Key);
  return i >= 0 ? p.l1Tiles[i] : null;
}

/** 여권 화면용 분모 — 시/군/구 총 타일 수. */
export function l2TotalTiles(l2Name: string): number | null {
  const p = load();
  const i = p.level2.findIndex((x) => x.name === l2Name);
  return i >= 0 ? p.l2Tiles[i] : null;
}
