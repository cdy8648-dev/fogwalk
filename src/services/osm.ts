import { CONFIG } from '../constants/config';
import { isSubwayHub, matchCurated } from '../constants/curatedLandmarks';
import type { Landmark, LandmarkCategory } from '../types';
import { getUserLangCode } from './locale';

/**
 * OSM(Overpass) 전담 모듈. 주변 랜드마크를 조회해 Landmark[]로 반환.
 * 네트워크 실패 시 null (재시도 가능하도록 빈 배열과 구분).
 */

// 여러 Overpass 엔드포인트를 순서대로 시도 (앞쪽이 우선).
// 프라이버시: 사용자 좌표가 전송되므로 EU 운영 미러만 사용(러시아 mail.ru 미러 제거).
// 조회 반경을 1km로 줄인 뒤 overpass-api.de 가 빠르고 안정적(≈2.5s).
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
// Overpass 예절: 의미 있는 User-Agent 필수 (없으면 406/429).
const USER_AGENT = 'FogWalk/1.0 (exploration app; cdy8648@naver.com)';

type Tags = Record<string, string | undefined>;

function categorize(tags: Tags): LandmarkCategory {
  // 경전철(light_rail: 우이신설·신림선 등)도 지하철 트랙으로 취급
  if (
    tags.railway === 'station' &&
    (tags.station === 'subway' || tags.station === 'light_rail' || tags.subway === 'yes')
  ) {
    return 'subway';
  }
  if (tags.aeroway === 'aerodrome') return 'airport';
  if (tags.railway === 'station') return 'train'; // KTX·일반 기차역 (지하철은 위에서 분기)
  if (tags.amenity === 'ferry_terminal') return 'port';
  if (tags.man_made === 'tower') return 'tower';
  if (tags.man_made === 'bridge') return 'bridge';
  if (tags.natural === 'peak') return 'peak';
  if (tags.tourism === 'museum') return 'museum';
  if (tags.leisure === 'park' || tags.boundary === 'national_park') return 'park';
  const h = tags.historic;
  if (h === 'palace' || h === 'castle' || h === 'fort' || h === 'fortress' || h === 'city_gate') {
    return 'palace';
  }
  if (h === 'monument' || h === 'memorial') return 'monument';
  if (tags.amenity === 'place_of_worship') {
    // 사찰만 temple, 그 외(성당·교회 등)는 historic 로 (⛩️ 오용 방지)
    return tags.religion === 'buddhist' ? 'temple' : 'historic';
  }
  if (h) return 'historic';
  if (tags.tourism === 'attraction') return 'attraction';
  return 'other';
}

/**
 * OSM 유네스코 세계유산 태그 감지 (전 세계 공통 표기).
 * 표준은 heritage:operator=whc(+heritage=1). ref:whc(등재번호)·whc:criteria 도 강한 신호.
 * → 화이트리스트 없는 해외에서도 세계유산이 자동 전설로 뜬다.
 */
function isUnescoTagged(tags: Tags): boolean {
  const op = (tags['heritage:operator'] ?? '').toLowerCase();
  if (op.includes('whc') || op.includes('unesco')) return true;
  return !!tags['ref:whc'] || !!tags['whc:criteria'];
}

/**
 * 희귀도 산정 (4단계 마스터 시트).
 * 전설/영웅/희귀 = 큐레이션 화이트리스트(QID 우선, 이름 폴백) + 유네스코 태그 자동 전설.
 * 교통 트랙은 고정 등급(공항=영웅·기차/항구=희귀·지하철=거점만 희귀), 그 외 자동수집 = 일반.
 */
function rarityOf(tags: Tags, name: string, category: LandmarkCategory): string {
  const curated = matchCurated(tags.wikidata, name);
  if (curated) return curated.rarity;
  if (isUnescoTagged(tags)) return 'legendary'; // 글로벌: 세계유산 = 자동 전설
  if (category === 'subway') return isSubwayHub(name) ? 'rare' : 'common';
  if (category === 'airport') return 'epic';
  if (category === 'train' || category === 'port') return 'rare';
  return 'common';
}

/**
 * OSM 태그만으로 표시 이름 결정 (동기·무네트워크): name:{userLang} → name:en → name(원문).
 * 원문(현지어)만 있고 유저 언어가 아니면 lang='src' → 이후 Wikidata 업그레이드 대상.
 * (Wikidata 라벨은 발견한 소수 랜드마크에 한해 landmarkNames 에서 지연 조회 — 대량 조회 방지)
 */
export function pickLocalName(
  tags: Tags,
  userLang: string
): { name: string; lang: string } {
  const local = tags[`name:${userLang}`];
  if (local) return { name: local, lang: userLang };
  const en = tags['name:en'];
  if (en) return { name: en, lang: 'en' };
  return { name: tags.name as string, lang: 'src' };
}

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Tags;
}

export async function fetchLandmarksAround(
  lat: number,
  lng: number,
  radiusM: number
): Promise<Landmark[] | null> {
  const a = `around:${radiusM},${lat},${lng}`;
  // 가벼운 단일키 조회 — 의미 필터(wikidata/문화재 등)는 parseElements 에서 JS로.
  // (조건을 쿼리에 많이 넣으면 dense 지역에서 Overpass 가 타임아웃 → 전부 0건이 됨)
  // 교통(지하철·공항·기차·항구)은 별도 out 블록: 도심에서 POI가 200개 캡을 치면
  // (서울시청 실측 200/200) 같은 묶음의 역이 잘려 영영 미발견되던 버그 방지.
  const query = `[out:json][timeout:25];
(
  nwr(${a})[tourism~"^(attraction|museum|viewpoint|artwork|gallery|theme_park|zoo|aquarium)$"][name];
  nwr(${a})[historic][name];
  nwr(${a})[man_made~"^(tower|bridge)$"][name];
  nwr(${a})[natural=peak][name];
  nwr(${a})[leisure=park][name];
  nwr(${a})[boundary=national_park][name];
  nwr(${a})[amenity=place_of_worship][name];
);
out center 200;
(
  nwr(${a})[railway=station][name];
  nwr(${a})[aeroway=aerodrome][name];
  nwr(${a})[amenity=ferry_terminal][name];
);
out center 80;`;

  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': USER_AGENT,
        },
        body: 'data=' + encodeURIComponent(query),
      });
      const ct = res.headers.get('content-type') ?? '';
      if (!res.ok || !ct.includes('json')) continue; // 다음 엔드포인트
      const json = (await res.json()) as {
        elements?: OverpassElement[];
        remark?: string;
      };
      // remark + 빈 결과 = 타임아웃/런타임 에러 → 실패로 보고 다음 엔드포인트 (잘못된 빈 캐시 방지)
      if (json.remark && (json.elements?.length ?? 0) === 0) continue;
      return parseElements(json.elements ?? [], getUserLangCode());
    } catch {
      continue;
    }
  }
  return null; // 모든 엔드포인트 실패 → 재시도 가능하도록 null
}

/**
 * "랜드마크라 부를 만한가" 판정 (의미 필터). 동네 교회·급수탑·작은 공원·잡관광지 제외.
 * 강한 신호 = wikidata/wikipedia, 문화재(heritage), 큐레이션 이름.
 */
function qualifies(tags: Tags, name: string, category: LandmarkCategory): boolean {
  const hasWiki = !!(tags.wikidata || tags.wikipedia);
  const hasHeritage = !!(tags.heritage || tags['heritage:operator']);
  if (isUnescoTagged(tags)) return true; // 세계유산은 카테고리 불문 인정
  switch (category) {
    case 'subway':
    case 'palace': // historic=castle/palace/fort/fortress/city_gate (본래 상징적)
      return true;
    // 박물관: 동네 전시관·폐관 미반영(OSM 스테일) 노이즈가 많아 위키/문화재 등재 요구
    case 'museum':
      return hasWiki || hasHeritage;
    // 교통 트랙: 실제 공항(군용 제외)·주요 기차역·여객터미널만
    case 'airport':
      return (hasWiki || !!tags.iata) && tags['aerodrome:type'] !== 'military' && !tags.military;
    case 'train':
    case 'port':
      return hasWiki;
    case 'attraction':
      return hasWiki || matchCurated(tags.wikidata, name) != null;
    case 'tower':
      return !!tags.height || !!tags.tourism || hasWiki;
    case 'bridge':
      return hasWiki;
    case 'park':
      return hasWiki || tags.boundary === 'national_park';
    case 'peak': {
      if (hasWiki) return true;
      const ele = parseFloat(tags.ele ?? '');
      return !Number.isNaN(ele) && ele >= CONFIG.PEAK_MIN_ELE_M;
    }
    // 사찰/성당·교회/기념물/일반유적: 위키 또는 문화재 등재가 있어야 인정
    case 'temple':
    case 'monument':
    case 'historic':
    default:
      return hasWiki || hasHeritage;
  }
}

function parseElements(elements: OverpassElement[], userLang: string): Landmark[] {
  const out: Landmark[] = [];
  for (const el of elements) {
    const tags = el.tags ?? {};
    const name = tags.name;
    const elLat = el.lat ?? el.center?.lat;
    const elLng = el.lon ?? el.center?.lon;
    if (!name || elLat == null || elLng == null) continue;
    const category = categorize(tags);
    if (!qualifies(tags, name, category)) continue;
    const display = pickLocalName(tags, userLang);
    out.push({
      osmId: `${el.type}/${el.id}`,
      name,
      category,
      lat: elLat,
      lng: elLng,
      rarity: rarityOf(tags, name, category),
      qid: tags.wikidata, // 큐레이션(유네스코 뱃지·축하 문구) 조회 키
      displayName: display.name,
      displayLang: display.lang,
    });
  }
  return out;
}
