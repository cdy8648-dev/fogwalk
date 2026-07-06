import type { Landmark } from '../types';
import { useLandmarkStore } from '../store/landmarkStore';
import { getDiscoveredNeedingDisplayName, setLandmarkDisplayName } from './db';
import { getUserLangCode } from './locale';

/**
 * 랜드마크 표시 이름의 Wikidata 업그레이드 계층.
 * OSM 태그만으로는 유저 언어 이름이 없을 때(현지어 원문만), Wikidata 라벨로 보강한다.
 * 대량 조회를 피하려고 "발견한" 소수 랜드마크에 한해서만 호출한다.
 */

const WIKIDATA_API = 'https://www.wikidata.org/w/api.php';
const USER_AGENT = 'FogWalk/1.0 (exploration app; cdy8648@naver.com)';
const BATCH = 50; // wbgetentities 권장 상한

type LabelMap = Record<string, { self?: string; en?: string }>;

/** QID 배치 → { qid: { self: userLang라벨, en: 영어라벨 } }. 실패 시 {} (앱 안전 폴백). */
async function fetchWikidataLabels(qids: string[], userLang: string): Promise<LabelMap> {
  const out: LabelMap = {};
  for (let i = 0; i < qids.length; i += BATCH) {
    const chunk = qids.slice(i, i + BATCH);
    const url =
      `${WIKIDATA_API}?action=wbgetentities&format=json&props=labels` +
      `&languages=${encodeURIComponent(userLang)}|en` +
      `&ids=${chunk.join('|')}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (!res.ok) continue;
      const json = (await res.json()) as {
        entities?: Record<string, { labels?: Record<string, { value: string }> }>;
      };
      const entities = json.entities ?? {};
      for (const [qid, ent] of Object.entries(entities)) {
        const labels = ent.labels ?? {};
        out[qid] = { self: labels[userLang]?.value, en: labels.en?.value };
      }
    } catch {
      /* 네트워크 실패 → 이 배치 건너뜀 (부분 성공 유지) */
    }
  }
  return out;
}

// 유저 언어 > 영어 > 원문(src/기타) 순의 우선순위 점수.
function langRank(lang: string | undefined, userLang: string): number {
  if (lang === userLang) return 3;
  if (lang === 'en') return 2;
  return 1;
}

/** Wikidata 라벨 → 유저 언어 우선 후보 { name, lang } (없으면 null). */
function candidateFrom(
  label: { self?: string; en?: string } | undefined,
  userLang: string
): { name: string; lang: string } | null {
  if (!label) return null;
  if (label.self) return { name: label.self, lang: userLang };
  if (label.en) return { name: label.en, lang: 'en' };
  return null;
}

/**
 * 새로 발견한 랜드마크 1건의 표시 이름을 Wikidata로 업그레이드(현지어 원문일 때만).
 * 성공 시 DB + 스토어 갱신. fire-and-forget로 호출 — 실패해도 조용히 넘어간다.
 */
export async function upgradeDiscoveryName(lm: Landmark): Promise<void> {
  const userLang = getUserLangCode();
  if (!lm.qid || lm.displayLang === userLang || lm.displayLang === 'en') return;

  const labels = await fetchWikidataLabels([lm.qid], userLang);
  const cand = candidateFrom(labels[lm.qid], userLang);
  if (!cand) return;
  if (langRank(cand.lang, userLang) <= langRank(lm.displayLang, userLang)) return;

  setLandmarkDisplayName(lm.osmId, cand.name, cand.lang);
  useLandmarkStore.getState().updateDisplayName(lm.osmId, cand.name, cand.lang);
}

/**
 * 앱 시작 시 1회: 표시 이름이 없거나 현지어 원문인 발견 랜드마크를 Wikidata로 보강.
 * (해외에서 이미 발견해 현지어로 저장된 것들이 대상) 백그라운드로 조용히 실행.
 */
export async function migrateDiscoveryDisplayNames(): Promise<void> {
  const userLang = getUserLangCode();
  const targets = getDiscoveredNeedingDisplayName(userLang);
  if (targets.length === 0) return;

  const qids = targets.filter((t) => t.qid).map((t) => t.qid as string);
  const labels = qids.length ? await fetchWikidataLabels(qids, userLang) : {};

  let changed = false;
  for (const lm of targets) {
    const cand = lm.qid ? candidateFrom(labels[lm.qid], userLang) : null;
    if (cand && langRank(cand.lang, userLang) > langRank(lm.displayLang, userLang)) {
      setLandmarkDisplayName(lm.osmId, cand.name, cand.lang);
      changed = true;
    } else if (lm.displayName == null) {
      // 업그레이드 불가(qid 없음/라벨 없음) + 표시 이름 미설정 → 원문으로 채워 재처리 방지
      setLandmarkDisplayName(lm.osmId, lm.name, lm.displayLang ?? 'src');
      changed = true;
    }
  }
  if (changed) useLandmarkStore.getState().hydrate();
}
