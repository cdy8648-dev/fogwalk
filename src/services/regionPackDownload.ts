import { AppState } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';

import { CONFIG } from '../constants/config';
import { useRegionPackStore } from '../store/regionPackStore';
import { registerPack, hasPack, type Pack } from './regionPack';

/**
 * 해외 지역팩 다운로드/캐시.
 * - 첫 방문 국가의 ADM1 팩을 GitHub raw에서 받아 Documents/regionPacks/<cc>.json 에 캐시.
 * - 소형(임계치 미만)은 무음 자동, 대형(미국·중국 등)은 사용자 탭 유도(로밍 방어 → store.pending).
 * - 배터리 헌장: 네트워크는 포그라운드에서만. 핫패스에서 호출 금지(국가 감지 콜백에서만).
 * - GitHub raw는 전송 gzip이라 통신량은 파일 크기의 ~1/3.
 */

const PACK_DIR = 'regionPacks';
type Manifest = Record<string, { bytes: number }>; // 키: 대문자 ISO2

let manifest: Manifest | null = null;
const attempted = new Set<string>(); // 이번 세션에 이미 시도한 국가(재시도 폭주 방지)

function packDir(): Directory {
  return new Directory(Paths.document, PACK_DIR);
}

/** 앱 시작 시(동기): 캐시된 해외 팩을 로드·등록. (KR은 번들이라 대상 아님) */
export function loadCachedPacks(): void {
  try {
    const dir = packDir();
    if (!dir.exists) return;
    for (const entry of dir.list()) {
      if (!(entry instanceof File) || !entry.name.endsWith('.json')) continue;
      try {
        const pack = JSON.parse(entry.textSync()) as Pack;
        registerPack(pack);
        useRegionPackStore.getState().markReady(pack.country);
      } catch (e) {
        if (__DEV__) console.warn('[regionPack] 캐시 파싱 실패:', entry.name, e);
      }
    }
  } catch (e) {
    if (__DEV__) console.warn('[regionPack] 캐시 로드 실패:', e);
  }
}

async function loadManifest(): Promise<Manifest | null> {
  if (manifest) return manifest;
  try {
    const res = await fetch(`${CONFIG.REGION_PACK_HOST}/manifest.json`);
    if (!res.ok) return null;
    manifest = (await res.json()) as Manifest;
    return manifest;
  } catch {
    return null; // 오프라인 등 — 다음 기회에
  }
}

/**
 * 국가 팩 확보 시도(포그라운드에서 국가 감지 시 호출, fire-and-forget).
 * 이미 보유/시도했으면 skip. 매니페스트에 없으면 팩 없는 국가(역지오코딩 폴백 유지).
 * 소형=자동 다운로드, 대형=보류(UI 칩) — store.pending.
 */
export async function ensurePackForCountry(cc: string, countryName: string): Promise<void> {
  const code = cc.toUpperCase();
  if (code === 'KR') return; // 번들
  if (hasPack(code) || attempted.has(code)) return;
  if (AppState.currentState !== 'active') return; // 배터리 헌장 — 포그라운드에서만 네트워크
  attempted.add(code);

  const man = await loadManifest();
  const entry = man?.[code];
  if (!entry) return; // 이 국가 팩 없음 → 폴백 유지

  if (entry.bytes < CONFIG.REGION_PACK_AUTO_MAX_BYTES) {
    await downloadPack(code); // 소형 — 무음 자동
  } else {
    useRegionPackStore.getState().setPending({ cc: code, name: countryName, bytes: entry.bytes });
  }
}

/**
 * 실제 다운로드 → 캐시 파일 기록 → 등록 → store.ready.
 * UI 칩(대형)에서도 이 함수를 직접 호출한다. 성공 true.
 */
export async function downloadPack(cc: string): Promise<boolean> {
  const code = cc.toUpperCase();
  const store = useRegionPackStore.getState();
  if (hasPack(code)) return true;
  store.setDownloading(code);
  try {
    const res = await fetch(`${CONFIG.REGION_PACK_HOST}/${code.toLowerCase()}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const pack = JSON.parse(text) as Pack; // 유효성 검증 겸

    const dir = packDir();
    if (!dir.exists) dir.create();
    const file = new File(dir, `${code.toLowerCase()}.json`);
    if (file.exists) file.delete();
    file.write(text);

    registerPack(pack);
    store.markReady(code); // pending·downloading 자동 해제
    if (__DEV__) console.log(`[regionPack] ${code} 다운로드 완료 (${pack.level1.length} 지역)`);
    return true;
  } catch (e) {
    if (__DEV__) console.warn(`[regionPack] ${code} 다운로드 실패:`, e);
    store.setDownloading(null);
    return false;
  } finally {
    if (useRegionPackStore.getState().downloading === code) store.setDownloading(null);
  }
}
