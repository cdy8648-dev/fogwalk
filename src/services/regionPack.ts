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
import { attributeTiles, getCurrentCountry } from './country';

/**
 * H3 멤버십 팩 — 행정경계를 compact H3 셀로 구운 오프라인 지역 판정.
 * 타일 → (시/도, 시/군/구) 룩업이 O(1)·네트워크 0·언어 무관이라 배터리 헌장에 부합.
 * 분모(지역 총 타일 수)도 팩에 내장 → 달성률 = 밝힌 타일 / 총 타일 (같은 단위, 오차 상쇄).
 *
 * 멀티국가: KR(시군구까지, subdivided)은 앱에 번들. 해외는 ADM1(주/도) 전용 팩을
 * 첫 방문 시 다운로드해 registerPack()으로 등록(regionPackDownload.ts). 팩 없는 국가는
 * 기존 역지오코딩 캐시(attributeTiles)로 폴백.
 */

export interface Pack {
  v: number;
  country: string; // ISO 2글자 (KR/JP/...)
  subdivided?: boolean; // false면 하위구역(시군구) 없음 — 여권은 지역까지만
  resMin: number;
  resMax: number;
  level1: { key: string; en?: string }[];
  level2: { name: string; l1: number }[];
  l1Tiles: number[];
  l2Tiles: number[];
  cells: Record<string, number>;
}

// 국가코드 → 팩. KR은 번들(지연 로드), 해외는 다운로드 후 등록.
const packs = new Map<string, Pack>();

/** 다운로드/캐시된 팩 등록 (regionPackDownload). country 필드로 키. */
export function registerPack(p: Pack): void {
  packs.set(p.country.toUpperCase(), p);
}

/** 해당 국가 팩 보유 여부. */
export function hasPack(cc: string): boolean {
  ensureKR();
  return packs.has(cc.toUpperCase());
}

// KR은 번들 — 0.9MB JSON 파싱을 첫 사용 시점으로 지연.
function ensureKR(): void {
  if (!packs.has('KR')) {
    packs.set('KR', require('../constants/regionPacks/kr.json') as Pack);
  }
}

function getPack(cc: string): Pack | null {
  ensureKR();
  return packs.get(cc.toUpperCase()) ?? null;
}

/** 타일 → 지역 인덱스(fine→coarse 부모 순회). 팩 밖이면 -1. */
function tileToL2Idx(p: Pack, tile: string): number {
  for (let res = p.resMax; res >= p.resMin; res--) {
    const idx = p.cells[cellToParent(tile, res)];
    if (idx != null) return idx;
  }
  return -1;
}

/** 타일(res10) → 지역. 국가 팩 기준. 팩 밖/미보유면 null. */
export function lookupTile(cc: string, tile: string): { l1: string; l2: string | null } | null {
  const p = getPack(cc);
  if (!p) return null;
  const idx = tileToL2Idx(p, tile);
  if (idx < 0) return null;
  const l2 = p.level2[idx];
  return { l1: p.level1[l2.l1].key, l2: p.subdivided === false ? null : l2.name };
}

/**
 * 신규 밝힌 타일 적립 — 현재 국가의 팩으로 판정, 미스(팩 밖/미보유)는 역지오코딩 폴백.
 * 핫패스에서 호출: getCurrentCountry()는 메모리 읽기, 룩업 O(1)/타일 (네트워크·풀스캔 없음).
 */
export function attributeRevealedTiles(tiles: string[]): void {
  if (tiles.length === 0) return;
  const c = getCurrentCountry();
  const cc = (c?.code ?? 'KR').toUpperCase();
  const pack = getPack(cc);
  if (!pack) {
    attributeTiles(tiles.length); // 팩 없는 국가 — 기존 역지오코딩 캐시 경로
    return;
  }
  const name = c?.name ?? pack.country;
  const byL2 = new Map<number, number>();
  let miss = 0;
  for (const t of tiles) {
    const idx = tileToL2Idx(pack, t);
    if (idx < 0) miss++;
    else byL2.set(idx, (byL2.get(idx) ?? 0) + 1);
  }

  let hit = 0;
  for (const [idx, n] of byL2) {
    hit += n;
    const l2 = pack.level2[idx];
    const l1 = pack.level1[l2.l1].key;
    upsertRegionTiles(cc, l1, n);
    if (pack.subdivided !== false) upsertSubregionTiles(cc, l1, l2.name, n);
  }
  if (hit > 0) upsertCountryTiles(cc, name, hit);
  if (miss > 0) attributeTiles(miss); // 팩 경계 밖(갭/국경) — 역지오코딩 폴백
}

/**
 * 소급 재계산(1회) — 원시 visited_tiles 전체를 KR 팩으로 재판정해 KR 통계를 재구축.
 * 과거의 이름 흔들림('서울특별시'/'서울'/'Seoul')·경계 오적립(충남→충북·과천→서울)을 청산한다.
 * (해외 팩은 다운로드 시점이 제각각이라 소급 없음 — 이후 이동부터 자연 적립.)
 */
export function rebuildKRStatsOnce(): void {
  // v2: 도 판정 재작성(과천/구리→경기, 세종/대덕→세종/대전 등 16건 교정) → 과거 타일 재집계 강제.
  if (getSetting('region_pack_v2') === '1') return;

  const all = getVisitedTilesSince(0);
  const agg = new Map<number, { n: number; first: number }>();
  let krTotal = 0;
  const p = getPack('KR');
  if (!p) return;
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
  setSetting('region_pack_v2', '1');
  if (__DEV__) console.log(`[regionPack] KR 재집계: ${krTotal} 타일 / ${agg.size} 시군구`);
}

/** 여권 화면용 분모 — 시/도 총 타일 수. 팩 없으면 null. */
export function l1TotalTiles(cc: string, l1Key: string): number | null {
  const p = getPack(cc);
  if (!p) return null;
  const i = p.level1.findIndex((x) => x.key === l1Key);
  return i >= 0 ? p.l1Tiles[i] : null;
}

/** 여권 화면용 분모 — 시/군/구 총 타일 수(subdivided 팩만). */
export function l2TotalTiles(cc: string, l2Name: string): number | null {
  const p = getPack(cc);
  if (!p || p.subdivided === false) return null;
  const i = p.level2.findIndex((x) => x.name === l2Name);
  return i >= 0 ? p.l2Tiles[i] : null;
}
