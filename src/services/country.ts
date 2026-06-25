import { haversineMeters } from '../utils/distance';
import {
  getAllCountryStats,
  getSetting,
  getTileCount,
  setSetting,
  upsertCountryTiles,
} from './db';
import { detectCountry, getCurrentCoarse } from './gps';

/**
 * 현재 국가 캐싱. 역지오코딩 호출을 아끼려고 멀리(>REDETECT_M) 이동했을 때만 재판별.
 * recordMovement(동기)에서 getCurrentCountry()로 읽어 신규 타일을 적립한다.
 */
const REDETECT_M = 30_000; // 30km

let current: { code: string; name: string } | null = null;
let anchor: { lat: number; lng: number } | null = null;
let inFlight = false;

export function getCurrentCountry(): { code: string; name: string } | null {
  return current;
}

/** 앱 시작 시 마지막 국가 복원 (재판별 없이 즉시 적립 가능하도록). */
export function hydrateCountry(): void {
  const code = getSetting('countryCode');
  if (code) current = { code, name: getSetting('countryName') ?? code };
}

/**
 * 포그라운드 복귀 시 선제 국가 감지. 신선한 위치 1회로 ensureCountry 를 앞당겨,
 * 해외 도착 직후 첫 칸들이 직전 국가로 잘못 적립되는 지연을 줄인다.
 */
export async function refreshCountry(): Promise<void> {
  try {
    const c = await getCurrentCoarse(); // 국가 판별엔 저정밀로 충분(배터리 절약)
    await ensureCountry(c.lat, c.lng);
  } catch {
    /* 위치 못 잡으면 다음 이동에서 자연 보정 */
  }
}

/** 필요 시(미설정 또는 먼 이동) 국가 재판별. fire-and-forget로 호출. */
export async function ensureCountry(lat: number, lng: number): Promise<void> {
  if (inFlight) return;
  const needs =
    !current || !anchor || haversineMeters(anchor, { lat, lng }) > REDETECT_M;
  if (!needs) return;

  inFlight = true;
  try {
    const c = await detectCountry(lat, lng);
    if (c) {
      current = c;
      anchor = { lat, lng };
      setSetting('countryCode', c.code);
      setSetting('countryName', c.name);
      backfillExistingTiles(c);
    }
  } finally {
    inFlight = false;
  }
}

/**
 * 최초 1회: 이 기능 이전에 쌓인 기존 타일을 현재 국가에 반영.
 * 이미 적립된 양과의 차액만 더해 중복을 막는다.
 */
function backfillExistingTiles(c: { code: string; name: string }): void {
  if (getSetting('countryBackfilled') === '1') return;
  const total = getTileCount();
  const existing = getAllCountryStats().find((s) => s.code === c.code)?.tiles ?? 0;
  if (total > existing) upsertCountryTiles(c.code, c.name, total - existing);
  setSetting('countryBackfilled', '1');
}
