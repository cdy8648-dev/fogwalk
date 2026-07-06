import { KR_CURATED } from './curated/kr';
import { JP_CURATED } from './curated/jp';
import { TW_CURATED } from './curated/tw';
import { TH_CURATED } from './curated/th';

/**
 * 큐레이션 랜드마크 화이트리스트 — 국가별 파일의 인덱스 + 매칭 로직.
 * ────────────────────────────────────────────────────────────
 * 좌표는 저장하지 않는다 — wikidata QID로 등급만 지정하고, 실제 좌표·이름은
 * OSM 요소(wikidata 태그 매칭)에서 온다. OSM에 태그가 없을 때를 대비해
 * 정규화 이름 폴백 매칭도 제공.
 *
 * 등급: legendary(전설·유네스코/국보급) / epic(영웅·국가적 현대상징) / rare(희귀·광역 대표).
 * 일반(common)은 여기 없음 — OSM 자동수집. 단, OSM의 유네스코 태그
 * (heritage:operator=whc)는 화이트리스트 없이도 자동 전설 처리(osm.ts).
 *
 * 새 국가 추가 방법: ./curated/<cc>.ts 에 배열을 만들고 아래 스프레드에 합친다.
 * QID는 반드시 Wikidata API로 검증(P17 국가·P31 유형 확인) — 틀린 QID를 넣느니 null.
 */

export type CuratedRarity = 'legendary' | 'epic' | 'rare';

export interface CuratedLandmark {
  qid: string | null; // Wikidata QID (미확보 항목은 이름 폴백으로만 매칭)
  name: string; // 표시·이름 폴백 매칭용
  aliases?: string[]; // 이름 폴백용 별칭 (OSM name 표기 변형)
  rarity: CuratedRarity;
  unesco?: boolean; // 유네스코 세계유산 교차 뱃지
  cheer?: string; // 발견 축하 문구 (마스터 시트 '발견 축하 문구' 열)
}

/** 전체 큐레이션 — 국가별 파일을 여기에 합친다. */
export const CURATED_LANDMARKS: CuratedLandmark[] = [...KR_CURATED, ...JP_CURATED, ...TW_CURATED, ...TH_CURATED];

/** QID → 큐레이션 (OSM wikidata 태그 매칭, 최우선). */
export const CURATED_BY_QID: Record<string, CuratedLandmark> = Object.fromEntries(
  CURATED_LANDMARKS.filter((l) => l.qid).map((l) => [l.qid as string, l])
);

function norm(s: string): string {
  return s.replace(/\s+/g, '').toLowerCase();
}

// 이름(별칭 포함) → 큐레이션. OSM 요소에 wikidata 태그가 없을 때의 폴백.
const CURATED_BY_NAME: Record<string, CuratedLandmark> = {};
for (const l of CURATED_LANDMARKS) {
  CURATED_BY_NAME[norm(l.name)] = l;
  for (const a of l.aliases ?? []) CURATED_BY_NAME[norm(a)] = l;
}

/** OSM 요소를 큐레이션과 매칭: wikidata QID 최우선, 정규화 이름 폴백. */
export function matchCurated(wikidata: string | undefined, name: string): CuratedLandmark | null {
  if (wikidata && CURATED_BY_QID[wikidata]) return CURATED_BY_QID[wikidata];
  return CURATED_BY_NAME[norm(name)] ?? null;
}

// 환승 거점 지하철역(역명에서 '역' 접미사 제거 후 매칭) → 도감 '희귀역'.
const HUBS = [
  '서울',
  '강남',
  '잠실',
  '사당',
  '신도림',
  '동대문역사문화공원',
  '고속터미널',
  '왕십리',
  '합정',
  '건대입구',
  '디지털미디어시티',
  '가산디지털단지',
  '시청',
  '연신내',
  '수원',
  '서면',
  '부산',
  '동대구',
  '대전',
  '반월당',
].map(norm);
const SUBWAY_HUBS = new Set(HUBS);

/** 환승 거점 지하철역인가 (도감 희귀역). */
export function isSubwayHub(name: string): boolean {
  return SUBWAY_HUBS.has(norm(name.replace(/역$/, '')));
}
